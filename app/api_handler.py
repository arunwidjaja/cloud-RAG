from imports import *

# Local Modules
import config
import utils
from query_data import query_rag
import initialize_chroma_db
import initialize_chroma_http_db
import update_database


database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Starting point for the app. Runs on startup.
    """
    print("FastAPI lifespan is starting")
    global database
    try:
        database = initialize_chroma_db.initialize()
        # database = initialize_chroma_http_db.initialize_http()
    except Exception as e:
        print(f"FastAPI startup error: {e}")
        raise
    yield

app = FastAPI(lifespan=lifespan)
handler = Mangum(app)


class QueryModel(BaseModel):
    query_text: str


class ContextModel(BaseModel):
    context: str
    source: str


class MessageModel(BaseModel):
    message: str
    id: str
    contexts: List[ContextModel]


class DeleteRequest(BaseModel):
    deletion_list: List


class DownloadRequest(BaseModel):
    download_list: List


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
    print(f"API CALL: get_db_file_list")
    try:
        file_list = utils.get_db_file_names(database)
        return JSONResponse(content=file_list)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@app.get("/db_uploads_list")
async def get_db_uploads_list():
    """
    Gets a list of the documents waiting to be pushed to the database
    """
    print("API CALL: get_uploads_list")
    try:
        file_list = utils.get_uploads_list()
        return JSONResponse(content=file_list)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@app.get("/push_files_to_database")
async def push_files_to_database():
    """
    Updates the database with all the uploaded documents
    """
    print("API CALL: push_files_to_database")
    try:
        pushed_files = update_database.push_to_database(database)
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
        download_list = utils.download_files(request.download_list)
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
            saved_files.append(file_path)
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
        deleted_files = update_database.delete_db_files(
            database, files_to_delete)
        return deleted_files
    except Exception as e:
        raise e


@app.delete("/delete_uploads")
async def delete_uploads(delete_request: DeleteRequest):
    """
    Delete the list of uploads from the uploads folder
    """
    files_to_delete = delete_request.deletion_list
    try:
        deleted_files = update_database.delete_uploads(files_to_delete)
        return deleted_files
    except Exception as e:
        raise e


# Run main to test locally on localhost:8000
# Don't forget to set initialize_chroma_db.initialize() to 'local', not 'lambda'
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT_APP}")
    uvicorn.run("api_handler:app", host=config.HOST, port=config.PORT_APP)
