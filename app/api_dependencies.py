# External Modules
from fastapi import Depends, HTTPException
from langchain_chroma import Chroma
from starlette.requests import Request

# Local Modules
import authentication
import init_db
import utils


class DatabaseManager:
    def __init__(self):
        self.auth = authentication.UserAuth()
        self.db = None
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
            email = self.auth.query_user_data(
                user_id=user_id, value="username")

            # Initialize the user's id
            self.uuid = user_id

            # Initialize user's DB
            self.db = init_db.init_db_chroma(
                collection_name=utils.strip_email(email)
            )
            return
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to initialize database: {str(e)}")

    def cleanup_current_connection(self) -> None:
        """
        Cleans the current database connection
        """
        if self.db is not None:
            # If Chroma has a cleanup method, call it here
            # self.db.cleanup()  # Uncomment if available
            self.db = None
        self.uuid = None
        print("Database connection cleaned up")

    def get_db(self) -> Chroma:
        """
        Return the user's database.
        """
        if self.db is None:
            raise HTTPException(
                status_code=500, detail="Database not initialized")
        return self.db

    def get_uuid(self) -> str:
        """
        Return the user's uuid.
        """
        if self.uuid is None:
            raise HTTPException(
                status_code=500, detail="User not initialized")
        return self.uuid


async def get_current_user_id(request: Request) -> str:
    """
    Gets the current user's ID.
    The ID should be passed in the request header.
    """
    user_id = request.headers.get("uuid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not provided")
    return user_id


# async def get_db(request: Request, user_id: str = Depends(get_current_user_id)) -> Chroma:
#     db_manager: DatabaseManager = request.app.state.db_manager
#     current_user_id = db_manager.get_uuid()
#     current_db = db_manager.get_db()
#     if user_id == current_user_id:
#         return current_db
#     else:
#         raise HTTPException(status_code=401, detail="User ID mismatch")


async def get_db_instance(request: Request, user_id: str = Depends(get_current_user_id)) -> DatabaseManager:
    db_manager: DatabaseManager = request.app.state.db_manager
    current_user_id = db_manager.get_uuid()
    if user_id == current_user_id:
        return db_manager
    else:
        raise HTTPException(status_code=401, detail="User ID mismatch")
