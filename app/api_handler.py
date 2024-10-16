# External packages
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic import BaseModel
from starlette.requests import Request
import uvicorn
from contextlib import asynccontextmanager

from typing import List
import os
import shutil

# Modules
import config
import utils
from query_data import query_rag
import initialize_chroma_db
import update_database


database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Starting point for the app. Runs on startup.
    """
    global database
    try:
        database = initialize_chroma_db.initialize()
    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)
handler = Mangum(app)


class Query(BaseModel):
    query_text: str


class DeleteRequest(BaseModel):
    deletion_list: List


# Mount static files (JS, CSS)
app.mount("/static", StaticFiles(directory=config.PATH_STATIC), name="static")
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
    try:
        file_list = utils.get_db_file_names(database)
        return JSONResponse(content=file_list)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@app.get("/db_uploads_queue")
async def get_db_docs_queue():
    """
    Gets a list of the documents waiting to be pushed to the database
    """
    try:
        file_list = utils.get_pending_file_names()
        return JSONResponse(content=file_list)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")

    return


@app.get("/push_files_to_database")
async def push_files_to_database():
    """
    Updates the database with all the documents uploaded on the backend
    """
    try:
        update_database.push_to_database(database)
        return JSONResponse(content="Database updated")
    except Exception as e:
        raise Exception(f"Exception occured when pushing files: {e}")

# POST OPERATIONS


@app.post("/submit_query")
async def submit_query(request: Query):
    """
    Send query to LLM and retrieve the response
    """
    print("submit_query endpoint has been called")
    message = query_rag(database, request.query_text)
    return {"query_response": message}

# TODO: Implement


@app.post("/upload_documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    saved_files = []

    document_path = utils.get_env_paths()['DOCS']
    for file in files:
        save_location = os.path.join(document_path, file.filename)

        try:
            # Save the file to the specified directory
            with open(save_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            saved_files.append(save_location)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload {
                                file.filename}: {str(e)}")

    return JSONResponse(content={"message": "Files uploaded successfully", "files": saved_files})

# DELETE OPERATIONS


@app.delete("/delete_files")
async def delete_files(delete_request: DeleteRequest):
    """
    Delete the list of files from the Chroma DB
    """
    files_to_delete = delete_request.deletion_list
    try:
        deletion_message = 'The following files have been deleted:\n'
        deleted_files = update_database.delete_db_files(
            database, files_to_delete)
        return {"deletion_message": f"{deletion_message}{'\n'.join(deleted_files)}"}
    except Exception as e:
        raise e


# Run main to test locally on localhost:8000
# Don't forget to set initialize_chroma_db.initialize() to 'local', not 'lambda'
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT}")
    uvicorn.run("api_handler:app", host=config.HOST, port=config.PORT)
