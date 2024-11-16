from langchain_chroma import Chroma

# LangChain object for holding instance of Chroma database.
# Shared across api endpoints
# Must be in a separate file to avoid circular imports
database: Chroma = None


def get_database() -> Chroma:
    return database


def set_database(db) -> None:
    global database
    database = db
