from imports import *


class QueryModel(BaseModel):
    query_text: str
    query_type: str


class CollectionModel(BaseModel):
    collection_name: str
    embedding_function: str


class FileModel(BaseModel):
    hash: str
    name: str
    collection: str
    word_countL: int = 0


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


class CredentialsModel(BaseModel):
    email: str
    pwd: str
