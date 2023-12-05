
from fastapi import FastAPI
from models import Query
import logging


from utils.database import create_table, check_if_exists, query_astra
from utils.youtube import download_subtitles


app = FastAPI()


@app.post("/")
def read_root(query: Query):
    # vectorIndex = VectorStoreIndexWrapper(vectorstore=myCassandraVStore)
    # answer = vectorIndex.query(query.query, llm=llm)
    # docs = []
    # for doc, score in myCassandraVStore.similarity_search_with_score(
    #     query=query.query, k=8
    # ):
    #     docs.append(
    #         {
    #             "content": doc.page_content,
    #             "score": score,
    #             "timestamp": doc.metadata["start"],
    #         }
    #     )
    #
    # print(docs)
    # answer = llm([system_message_prompt.format(query=query.query, context=str(docs))])
    return {
        "Hi": "There",
    }


@app.post("/get-transcription")
def get_transcription(query: Query):

    exists = check_if_exists(query.youtube_id)
    if exists:
        result = query_astra(query.query, query.youtube_id, query.chat)
        return result

    download_subtitles(query.youtube_id)

    result = query_astra(query.query, query.youtube_id, query.chat)

    return result

    