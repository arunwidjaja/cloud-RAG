# External Modules
from fastapi import Depends, HTTPException
from langchain_postgres import PGVector
from starlette.requests import Request
from sqlalchemy import Engine, text
from typing import List

# Local Modules
from db_collections import format_name, extract_user_collections

import authentication
import init_db
import utils


class DatabaseManager:
    def __init__(self):
        self.auth = authentication.UserAuth()
        self.store = None
        self.db_connection = None
        self.uuid = None
        print("DatabaseManager Initialized")

    def initialize_db(self, user_id: str) -> None:
        """
        Initializes the database for the given user
        """
        if not user_id:
            return None
        try:
            # Get the user's email
            email = self.auth.get_user_data(
                uuid=user_id, value="username")

            # Initialize the user's id
            self.uuid = user_id

            # Connect to the database.
            self.db_connection = init_db.get_connection_pg()

            # Initialize a LangChain object with the default collection
            # Default collection is based on the user's email
            default_collection = format_name(
                collections=[utils.strip_email(email)],
                uuid=user_id)[0]

            self.store = init_db.init_store_pgv(
                collection_name=default_collection
            )
            return
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize database: {str(e)}"
            )

    def get_connection(self) -> Engine:
        if self.db_connection is not None:
            return self.db_connection
        else:
            raise HTTPException(
                status_code=500,
                detail="DB connection not initialized!"
            )

    def cleanup_current_connection(self) -> None:
        """
        Cleans the current database connection
        """
        if self.store is not None:
            self.store = None
        self.uuid = None
        print("Database connection cleaned up")

    def get_current_store(self) -> PGVector:
        """
        Returns a LangChain instance pointing to the current collection.
        """
        if self.store is None:
            raise HTTPException(
                status_code=500, detail="Collection not initialized!")
        return self.store

    def get_store(self, collection: str) -> PGVector:
        """
        Returns a LangChain instance pointing to the specified collection.
        """
        all_user_collections = self.get_user_collections()
        if collection in all_user_collections:
            store = init_db.init_store_pgv(collection)
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
        if self.uuid is None:
            raise HTTPException(
                status_code=500, detail="User not initialized")
        return self.uuid

    def get_user_collections(self) -> List[str]:
        """
        Returns a list of the collections belonging to the current user.
        """
        user_cols: List[str]
        uuid = self.get_uuid()
        if self.db_connection is not None:
            with self.db_connection.connect() as connection:
                cols = connection.execute(
                    text("SELECT name FROM langchain_pg_collection;")
                )
                all_cols = [row[0] for row in cols]
            user_cols = extract_user_collections(all_cols, uuid)
            return user_cols
        else:
            raise HTTPException(
                status_code=401,
                detail="Not connected to DB yet."
            )


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
