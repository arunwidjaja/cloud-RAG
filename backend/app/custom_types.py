from enum import Enum
from typing import TypedDict


class FileMetadata(TypedDict):
    hash: str
    name: str
    collection: str
    word_count: int
    token_count: int


class ProcessingStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentTypes(Enum):
    UPLOAD = "upload"
    ATTACHMENT = "attachment"


class ReservedCollections(Enum):
    ATTACHMENTS = "attachments"


class Embeddings(Enum):
    OPENAI = "openai"
    BEDROCK = "bedrock"
    OLLAMA = "ollama"
