from typing import TypedDict


class FileMetadata(TypedDict):
    hash: str
    name: str
    collection: str
    word_count: int
    token_count: int
