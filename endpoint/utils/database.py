from datetime import datetime
from typing import List

import cassio
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement
from dotenv import load_dotenv
import os
import arrow

from models import ChatMessage, FixedSubs

load_dotenv()
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
auth_provider = PlainTextAuthProvider(os.getenv("ASTRA_DB_CLIENT"), os.getenv("ASTRA_DB_SECRET"))

cluster = Cluster(
    cloud={
        "secure_connect_bundle": os.getenv("SECURE_CONNECT_BUNDLE_PATH")
    },
    auth_provider=auth_provider,
)

session = cluster.connect()


def check_if_exists(youtube_id: str) -> bool:
    print("Checking if exists")

    query = f"""
    SELECT youtube_id FROM {os.getenv("ASTRA_DB_KEYSPACE")}.videos WHERE youtube_id = '{youtube_id}' LIMIT 1;
    """
    rows = session.execute(query)
    if not rows:
        return False
    return True


def create_table():
    auth_provider = PlainTextAuthProvider(os.getenv("ASTRA_DB_CLIENT"), os.getenv("ASTRA_DB_SECRET"))

    cluster = Cluster(
        cloud={
            "secure_connect_bundle": "secure-connect-youtubeai.zip"
        },
        auth_provider=auth_provider,
    )

    session = cluster.connect()
    query = f"""
    CREATE TABLE IF NOT EXISTS {os.getenv("ASTRA_DB_KEYSPACE")}.videos (
    youtube_id text,
    words text,
    start_time time,
    vector vector<float, 1536>,
    PRIMARY KEY (youtube_id, start_time)
    );
    """

    session.execute(query)
    print("Table created successfully")


def embed_transcript(transcript: List[FixedSubs], youtube_id: str, query=None):

    if query:
        print("Embedding query")
        return client.embeddings.create(
            model="text-embedding-ada-002",
            input=query
        ).data[0].embedding

    print("Embedding transcript")
    embeddings = client.embeddings.create(
        model="text-embedding-ada-002",
        input=[
            sub.text for sub in transcript
        ]
    ).data

    for e in embeddings:
        transcript[embeddings.index(e)].embedding = e.embedding

    print("pushing to cassandra")

    prepared = session.prepare(
        f"""
        INSERT INTO {os.getenv("ASTRA_DB_KEYSPACE")}.videos (youtube_id, words, vector, start_time)
        VALUES (?, ?, ?, ?);
        """
    )

    batch = BatchStatement()

    for sub in transcript:
        start_time = datetime.strptime(sub.start_time, "%H:%M:%S.%f").time()

        batch.add(prepared, (youtube_id, sub.text, sub.embedding, start_time))

    try:
        session.execute(batch)
    except Exception as e:
        print(f"An error occured: {e}")

    return transcript


def query_astra(query: str, youtube_id: str, chat: List[ChatMessage] = []):
    print("Querying Astra")
    embedding = embed_transcript([], youtube_id, query=query)
    prepared = session.prepare(
        f"""
        SELECT words, start_time FROM {os.getenv("ASTRA_DB_KEYSPACE")}.videos 
        WHERE youtube_id = '{youtube_id}'
        ORDER BY vector ANN OF {embedding} 
        LIMIT 1;
        """
    )
    rows = list(session.execute(prepared))

    for row in rows:
        result = row.words
        start_time = datetime.strptime(row.start_time.time().strftime("%H:%M:%S"), "%H:%M:%S").time()

    messages = [{
        "role": "system",
        "content": "You are a youtube helper bot. "
                   "Your job is to help answer questions about a video based on the vector "
                   "database results that are given to you. Please keep your answers brief. "
    }]

    for message in chat:
        messages.append(message)

    messages.append({
        "role": "user",
        "content": f"User Query: {query}"
                   f"vector search results: {result}"
    })

    chat = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=messages
    )
    return {
        "chat": chat.choices[0].message.content,
        "time": start_time
    }
