# External Modules
from fastapi import Depends, HTTPException
from langchain_postgres import PGVector
from starlette.requests import Request
from sqlalchemy import create_engine, Engine, text
from typing import List

# Local Modules
from collection_utils import extract_user_collections
from get_embedding_function import get_embedding_function

import authentication_manager
import config


class DatabaseManager:
    """
    Class for managing the connection to the database.
    Database currently contains embeddings, user chats, and authentication.
    Authentication is split into a different class even though it's the same DB.
    This is in case authentication gets moved to a different database later.
    """

    def __init__(self):
        self.auth = authentication_manager.AuthenticationManager()
        self.db_connection = self.create_connection()
        self.uuid = ""
        print("DatabaseManager Initialized")

    def create_connection(self) -> Engine:
        """
        Returns a connection to the PostgreSQL database.
        """
        username = config.USERNAME_DB_MAIN
        password = config.PASSWORD_DB_MAIN
        port = config.PORT_DB_MAIN_RDS
        host = config.HOST_DB_MAIN_RDS
        database = config.DB_MAIN

        try:
            connection_string = (
                f"postgresql+psycopg2://"
                f"{username}:"
                f"{password}"
                f"@{host}:"
                f"{port}"
                f"/{database}"
            )
            engine = create_engine(connection_string)
            return engine
        except Exception as e:
            print(f"Error connecting to the vector database: {e}")
            raise HTTPException(
                status_code=404,
                detail="Couldn't connect to the vector database."
            )

    def set_uuid(self, uuid: str) -> None:
        self.uuid = uuid

    def get_connection(self) -> Engine:
        return self.db_connection

    def cleanup_current_connection(self) -> None:
        """
        Cleans the current database connection
        """
        self.db_connection.dispose()
        self.uuid = ""
        self.auth = None
        print("Database connection cleaned up")

    def get_collection(self, collection: str, embedding_function: str = 'openai') -> PGVector:
        """
        Returns a LangChain instance pointing to the specified collection.
        """
        all_user_collections = self.get_user_collections()
        if collection in all_user_collections:
            store = PGVector(
                connection=self.db_connection,
                embeddings=get_embedding_function(embedding_function),
                collection_name=collection
            )
            return store
        else:
            raise HTTPException(
                status_code=404,
                detail="Collection not found."
            )

    def get_collection_id(self, collection: str) -> str | None:
        """
        Gets the internal Postgres UUID for the particular collection
        """
        engine = self.get_connection()
        query = text(
            "SELECT id FROM langchain_pg_collection WHERE name = :name")
        with engine.connect() as connection:
            result = connection.execute(query, {"name": collection})
            row = result.first()
            return str(row[0]) if row else None

    def get_uuid(self) -> str:
        """
        Return the user's uuid.
        """
        if not self.uuid:
            raise HTTPException(
                status_code=500, detail="User not initialized")
        return self.uuid

    def get_user_collections(self) -> List[str]:
        """
        Returns a list of the collections belonging to the current user.
        """
        user_cols: List[str]
        uuid = self.get_uuid()
        with self.db_connection.connect() as connection:
            cols = connection.execute(
                text("SELECT name FROM langchain_pg_collection;")
            )
            all_cols = [row[0] for row in cols]
        user_cols = extract_user_collections(all_cols, uuid)
        return user_cols


async def get_current_user_id(request: Request) -> str:
    """
    Gets the current user's ID.
    The ID should be passed in the request header.
    """
    user_id = request.headers.get("uuid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not provided")
    return user_id


async def get_db_instance(request: Request, user_id: str = Depends(get_current_user_id)) -> DatabaseManager:
    db_manager: DatabaseManager = request.app.state.db_manager
    current_user_id = db_manager.get_uuid()
    if user_id == current_user_id:
        return db_manager
    else:
        raise HTTPException(status_code=401, detail="User ID mismatch")
