from typing import TypedDict


class ChunkMetadata(TypedDict):
    user_id: str
    source_hash: str
    source_base_name: str
    collection: str
    word_count: int


class FileMetadata(TypedDict):
    hash: str
    name: str
    collection: str
    word_count: int
