from pydantic import BaseModel
from typing import List


class CollectionModel(BaseModel):
    collection_name: str
    embedding_function: str


class FileModel(BaseModel):
    hash: str
    name: str
    collection: str
    word_count: int = 0


class ContextModel(BaseModel):
    text: str
    file: FileModel


class MessageModel(BaseModel):
    id: str
    type: str = ""
    text: str
    context_list: List[ContextModel] = []


class ChatModel(BaseModel):
    id: str
    subject: str
    messages: List[MessageModel]


class QueryModel(BaseModel):
    query_text: str
    chat: ChatModel
    query_type: str


class CredentialsModel(BaseModel):
    username: str
    email: str
    pwd: str


class OTPModel(BaseModel):
    email: str
    otp: str


class StartSessionModel(BaseModel):
    user_id: str
