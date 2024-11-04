from imports import *

# Local Modules
import config
import utils
import init_db
import db_ops
import db_ops_utils
import doc_ops_utils

from query_data import query_rag


database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Starting point for the app. Runs on startup.
    """
    print("FastAPI lifespan is starting")
    global database
    try:
        database = init_db.init_db()
        # database = init_db.init_http_db()
    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)
handler = Mangum(app)


class QueryModel(BaseModel):
    query_text: str


class DeleteRequest(BaseModel):
    deletion_list: List


class DownloadRequest(BaseModel):
    download_list: List


class ContextModel(BaseModel):
    context: str
    source: str
    hash: str


class MessageModel(BaseModel):
    message: str
    id: str
    contexts: List[ContextModel]


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


@app.get("/db_files_metadata")
async def get_db_files_metadata():
    """
    Gets the metadata of all unique files in the database
    """
    print(f"API CALL: get_db_files_metadata")
    try:
        file_metadata = db_ops_utils.get_db_files_metadata(database)
        return JSONResponse(content=file_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@app.get("/uploads_metadata")
async def get_uploads_metadata():
    """
    Gets the metadata of all uploads
    """
    print("API CALL: get_uploads_metadata")
    try:
        uploads_metadata = doc_ops_utils.get_uploads_metadata()
        return JSONResponse(content=uploads_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting uploads list: {e}")


@app.get("/initiate_push_to_db")
async def initiate_push_to_db():
    """
    Updates the database with all the uploaded documents
    """
    print("API CALL: push_files_to_database")
    try:
        pushed_files = db_ops.push_to_database(database)
        return pushed_files
    except Exception as e:
        raise Exception(f"Exception occured when pushing files: {e}")

# POST OPERATIONS


@app.post("/download_files")
async def download_files(request: DownloadRequest):
    """
    Downloads the specified files and returns a list of the downloaded files.
    """
    print("API CALL: download_files")
    try:
        download_list = db_ops_utils.download_files(request.download_list)
        return download_list
    except Exception as e:
        raise Exception(f"Exception occurred when downloading files: {e}")


@app.post("/submit_query")
async def submit_query(request: QueryModel):
    """
    Send query to LLM and retrieve the response
    """
    print("API CALL: submit_query")
    query_response = query_rag(database, request.query_text)

    message = query_response.message
    id = query_response.id
    contexts = query_response.contexts
    message_model = MessageModel(message=message, id=id, contexts=contexts)

    return {"message_model": message_model}


@app.post("/upload_documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    print(f"API CALL: upload_documents")
    saved_files = []
    uploads_path = utils.get_env_paths()['DOCS']

    print(f"Files received: {files}")
    for file in files:
        file_path = os.path.join(uploads_path, file.filename)

        try:
            # Save the file to the specified directory
            print(f"Copying {file} to {file_path}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(utils.extract_file_name(file_path))
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
    file_hashes_to_delete = delete_request.deletion_list
    try:
        deleted_files = db_ops.delete_db_files(
            database, file_hashes_to_delete)
        return deleted_files
    except Exception as e:
        raise e


@app.delete("/delete_uploads")
async def delete_uploads(delete_request: DeleteRequest):
    """
    Delete the list of uploads from the uploads folder
    """
    upload_hashes_to_delete = delete_request.deletion_list
    try:
        deleted_files = doc_ops_utils.delete_uploads(upload_hashes_to_delete)
        return deleted_files
    except Exception as e:
        raise e


# Run main to test locally on localhost:8000
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT_APP}")
    uvicorn.run("api_handler:app", host=config.HOST, port=config.PORT_APP)
