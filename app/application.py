from imports import *

# Local Modules
import config
import init_db
import authentication
import utils

from api_MODELS import StartSessionModel
from api_dependencies import DatabaseManager

from api_GET import router as api_GET
from api_DELETE import router as api_DELETE
from api_POST import router as api_POST


@asynccontextmanager
async def lifespan(application: FastAPI):
    """
    Starting point for the app. Runs on startup.
    """
    print("FastAPI lifespan is starting")

    try:
        db_manager = DatabaseManager()
        application.state.db_manager = db_manager
        yield

        # database = init_db.init_http_db()
    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    finally:
        # TODO: check if Chroma DB has a cleanup function
        print("Need to add a cleanup function")


application = FastAPI(lifespan=lifespan)


@application.post("/start_session")
async def start_session(request: StartSessionModel, request2: Request):
    """
    Starts the user's session. Connects to the database.

    Args:
        request: the Pydantic request from frontend
        request2: used to access FastAPI state information
    """
    user_id = request.user_id
    init_db.init_paths(user_id)
    db_manager = request2.app.state.db_manager
    db_manager.initialize_db(user_id)
    return {"status": "success", "user_id": request.user_id}

application.add_middleware(
    CORSMiddleware,
    # React.JS urls (Create, Vite)
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ragbase.cloud",
        "https://www.ragbase.cloud",
        "https://api.ragbase.cloud"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

application.include_router(api_GET)
application.include_router(api_DELETE)
application.include_router(api_POST)


# handler = Mangum(app)


# Run main to test locally on localhost:8000
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT_APP}")
    uvicorn.run("application:application",
                host=config.HOST, port=config.PORT_APP)
