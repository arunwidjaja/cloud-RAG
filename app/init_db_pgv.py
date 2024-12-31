# External Modules
from langchain_postgres import PGVector
from sqlalchemy import create_engine

# import psycopg2

# Local Modules
from get_embedding_function import get_embedding_function

import config


def init_db(collection_name: str, embedding_function: str = 'openai') -> PGVector:
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
        # Get connection string from environment variables

        # connection = psycopg2.connect(
        #     host=config.HOST_PG,
        #     port=config.PORT_DB_PG,
        #     database=config.DATABASE,
        #     user=config.USERNAME_POSTGRES,
        #     password=config.PASSWORD_POSTGRES
        # )

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


def main():
    init_db("testdb")


if __name__ == "__main__":
    main()
