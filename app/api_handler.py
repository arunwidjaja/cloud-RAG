from imports import *

# Local Modules
import config
import utils
import init_db
import db_ops
import db_ops_utils
import doc_ops_utils

from globals import get_database, set_database

from api_endpoints import router as api_router
from query_data import query_rag
from summarize import summarize_map_reduce


class QueryModel(BaseModel):
    query_text: str
    query_type: str


class CollectionModel(BaseModel):
    collection_name: str
    embedding_function: str


class DeleteRequest(BaseModel):
    deletion_list: List


class DownloadRequest(BaseModel):
    download_list: List


class SummarizeRequest(BaseModel):
    file_list: List
    preset: str


class ContextModel(BaseModel):
    context: str
    source: str
    hash: str


class MessageModel(BaseModel):
    message: str
    id: str
    contexts: List[ContextModel]


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
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React.JS url
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

handler = Mangum(app)


@app.get("/download_files")
async def download_files(hashes: List[str] = Query(...), collection: List[str] = Query(...)):
    """
    Downloads the specified files and returns a list of the downloaded files.
    """
    print("API CALL: download_files")
    if hashes is None or not isinstance(hashes, list):
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        # Collection can only have one element in it
        download_list = db_ops_utils.download_files(hashes, collection[0])
        return download_list
    except Exception as e:
        raise Exception(f"Exception occurred when downloading files: {e}")


@app.get("/initiate_push_to_db")
async def initiate_push_to_db(collection: List[str] = Query(...)):
    """
    Updates the database with all the uploaded documents
    """
    print("API CALL: push_files_to_database")
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        database = get_database()
        # Collection can only have one element in it
        pushed_files = db_ops.push_to_database(database, collection[0])
        return pushed_files
    except Exception as e:
        raise Exception(f"Exception occured when pushing files: {e}")


@app.delete("/delete_files")
async def delete_files(hashes: List[str] = Query(...), collection: List[str] = Query(...)):
    """
    Delete the list of files from the Chroma DB
    """
    print("API CALL: /delete_files")
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        database = get_database()
        # Collection can only have one element in it
        deleted_files = db_ops.delete_db_files(
            database,
            hashes,
            collection_name=collection[0]
        )
        return deleted_files
    except Exception as e:
        raise e


@app.get("/summary")
async def summarize(hashes: List[str] = Query(...)):
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        database = get_database()
        summary = summarize_map_reduce(
            db=database,
            doc_list=hashes,
            preset='GENERAL'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@app.get("/theme")
async def analyze_theme(hashes: List[str] = Query(...)):
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        database = get_database()
        summary = summarize_map_reduce(
            db=database,
            doc_list=hashes,
            preset='THEMES_INTERVIEWS_1'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@app.post("/create_collection")
async def create_collection(request: CollectionModel):
    """
    Create a new collection in the database
    """
    print("API CALL: create_collection")
    try:
        database = get_database()
        collection_name = request.collection_name
        ef = request.embedding_function
        collection = db_ops.add_persistent_collection(
            database, collection_name, ef)
        return collection
    except Exception as e:
        raise Exception(f"Exception occurred when creating a collection: {e}")


@app.post("/submit_query")
async def submit_query(request: QueryModel):
    """
    Send query to LLM and retrieve the response
    """
    print("API CALL: submit_query")
    database = get_database()
    query_response = query_rag(
        db=database,
        query_text=request.query_text,
        query_type=request.query_type)

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
    return saved_files


@app.delete("/delete_uploads")
async def delete_uploads(hashes: List[str] = Query(...)):
    """
    Delete the list of uploads from the uploads folder
    """
    print("API CALL: delete_uploads")
    if hashes is None or not isinstance(hashes, list):
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")

    try:
        deleted_files = doc_ops_utils.delete_uploads(hashes)
        return deleted_files
    except Exception as e:
        raise e


# Run main to test locally on localhost:8000
if __name__ == "__main__":
    print(f"Running the FastAPI server locally on port {config.PORT_APP}")
    uvicorn.run("api_handler:app", host=config.HOST, port=config.PORT_APP)
