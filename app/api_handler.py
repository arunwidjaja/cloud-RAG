from imports import *

# Local Modules
import config
import init_db


from globals import set_database

from api_GET import router as api_GET
from api_DELETE import router as api_DELETE
from api_POST import router as api_POST


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Starting point for the app. Runs on startup.
    """
    print("FastAPI lifespan is starting")

    try:
        database = init_db.init_db()
        # database = init_db.init_http_db()

        set_database(database)

    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(api_GET)
app.include_router(api_DELETE)
app.include_router(api_POST)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React.JS url
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# handler = Mangum(app)


# Run main to test locally on localhost:8000
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT_APP}")
    uvicorn.run("api_handler:app", host=config.HOST, port=config.PORT_APP)
