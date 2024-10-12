# External packages
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from mangum import Mangum  # AWS Lambda handler
from pydantic import BaseModel
from starlette.requests import Request
import uvicorn
from langchain_chroma import Chroma
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse

# Modules
import config
import utils
from query_data import query_rag
import initialize_chroma_db
import update_database


database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI starting...")
    try:
        global database
        database = initialize_chroma_db.initialize('local')
        print("DB initialized")
    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)
handler = Mangum(app)


class Query(BaseModel):
    query_text: str


# Mount HTML/CSS
# app.mount("/static", StaticFiles(directory=config.PATH_STATIC), name="static")
templates = Jinja2Templates(directory=config.PATH_TEMPLATES)


# GET OPERATIONS


@app.get("/")
async def read_root(request: Request):
    """
    Loads the landing page
    """
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/db_file_list")
async def get_db_file_list():
    """
    Gets a list of source files in the database
    """
    file_list = utils.get_db_files(database)
    return JSONResponse(content=file_list)


@app.get('/refresh_database')
async def refresh_database():
    update_database.add_to_database(database)
    return JSONResponse(content="Database updated")


@app.post("/submit_query")
async def submit_query(request: Query):
    """
    Send query to LLM
    """
    message = query_rag(database, request.query_text)
    return {"query_response": message}


# Run main to test locally on localhost:8000
# Don't forget to change the initialization function param to "local" from "lambda"
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.port}")
    uvicorn.run("api_handler:app", host="0.0.0.0", port=config.port)
