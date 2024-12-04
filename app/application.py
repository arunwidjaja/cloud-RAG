from imports import *

# Local Modules
import config
import init_db


from globals import set_database

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
        init_db.init_paths()
        database = init_db.init_db()
        # database = init_db.init_http_db()

        set_database(database)

    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

application = FastAPI(lifespan=lifespan)

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
