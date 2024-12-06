from imports import *

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

    def initialize_db(self, user_id) -> None:
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
            self.db = init_db.init_db(
                user_id=utils.strip_text(user_id),
                collection_name=utils.strip_email(email)
            )
            print(f"Initialized DB for user: {user_id}")
            return
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to initialize database: {str(e)}")

    def get_id(self) -> str:
        """
        Return the 
        """

    def get_db(self) -> Chroma:
        """
        Return the user's database.
        """
        if self.db is None:
            raise HTTPException(
                status_code=500, detail="Database not initialized")
        return self.db


async def get_current_user_id(request: Request) -> str:
    """
    Gets the current user's ID.
    The ID should be passed in the request header.
    """
    user_id = request.headers.get("uuid")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not provided")
    return user_id


async def get_db(request: Request, user_id: str = Depends(get_current_user_id)) -> Chroma:
    db_manager = request.app.state.db_manager
    current_user_id = db_manager.uuid
    if user_id == current_user_id:
        return db_manager.db
    else:
        raise HTTPException(status_code=401, detail="User ID mismatch")
