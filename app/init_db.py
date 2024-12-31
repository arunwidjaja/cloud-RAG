# External Modules
from langchain_chroma import Chroma
from langchain_postgres import PGVector
from sqlalchemy import create_engine

import chromadb

# Local Modules
from get_embedding_function import get_embedding_function
from paths import get_paths, set_env_paths

import config


def init_db_chroma(collection_name: str, embedding_function: str = 'openai') -> Chroma:
    """
    Creates a Chroma (LangChain) instance that connects to a Chroma DB.

    Args:
        collection_name: the name of the default collection. Chroma DB requires at least one collection

    Returns:
        The LangChain Chroma object pointing to the DB
    """
    chroma_path = get_paths().DB_MAIN
    ef = get_embedding_function(embedding_function)

    try:
        print("Connecting to the Chroma DB at:")
        print(f"...{'/'.join(chroma_path.parts[-3:])}")
        persistent_client = chromadb.PersistentClient(
            path=str(chroma_path)
        )
        existing_collections = persistent_client.list_collections()
        if not existing_collections:
            default_collection = collection_name
        else:
            default_collection = existing_collections[0].name
        db = Chroma(
            collection_name=default_collection,
            client=persistent_client,
            embedding_function=ef
        )
        return db
    except Exception as e:
        print(f"There was an error connecting to the Chroma DB: {e}")
        raise


def init_db_pgv(collection_name: str, embedding_function: str = 'openai') -> PGVector:
    """
    Creates a PGVector (LangChain) instance that connects to a Postgres DB with pgvector extension.
    Args:
        collection_name: the name of the collection (maps to table name in Postgres)
        embedding_function: the embedding function to use (e.g., 'openai')
    Returns:
        The LangChain PGVector object pointing to the DB
    """
    ef = get_embedding_function(embedding_function)

    username = config.USERNAME_POSTGRES
    password = config.PASSWORD_POSTGRES
    port = config.PORT_DB_PG
    host = config.HOST_PG
    database = config.DATABASE

    try:
        connection_string = (
            f"postgresql+psycopg2://"
            f"{username}:"
            f"{password}"
            f"@{host}:"
            f"{port}"
            f"/{database}"
        )

        # Create SQLAlchemy engine
        engine = create_engine(connection_string)

        # Initialize PGVector
        store = PGVector(
            connection=engine,
            embeddings=ef,
            collection_name=collection_name
        )
        return store

    except Exception as e:
        print(f"There was an error connecting to the Postgres DB: {e}")
        raise


def init_paths(user_id: str) -> None:
    """
    Initializes necessary directories
    """
    set_env_paths(user_id)


def main():
    return


if __name__ == "__main__":
    main()
