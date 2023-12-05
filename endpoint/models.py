from typing import List

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class Query(BaseModel):
    query: str
    youtube_id: str
    chat: List[ChatMessage] = []


class FixedSubs(BaseModel):
    start_time: str
    text: str
    embedding: List[float] = []