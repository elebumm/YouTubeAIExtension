
from fastapi import FastAPI
from models import Query
import logging


from utils.database import create_table, check_if_exists, query_astra
from utils.youtube import download_subtitles


app = FastAPI()

@app.post("/get-transcription")
def get_transcription(query: Query):

    exists = check_if_exists(query.youtube_id)
    if exists:
        result = query_astra(query.query, query.youtube_id, query.chat)
        return result

    download_subtitles(query.youtube_id)

    result = query_astra(query.query, query.youtube_id, query.chat)

    return result

    