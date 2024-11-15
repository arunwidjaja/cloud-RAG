from imports import *

# Local Modules
from globals import get_database
from query_data import query_rag
import db_ops
import utils

router = APIRouter()


class QueryModel(BaseModel):
    query_text: str
    query_type: str


class CollectionModel(BaseModel):
    collection_name: str
    embedding_function: str


class ContextModel(BaseModel):
    context: str
    source: str
    hash: str


class MessageModel(BaseModel):
    message: str
    id: str
    contexts: List[ContextModel]


@router.post("/create_collection")
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


@router.post("/submit_query")
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


@router.post("/upload_documents")
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
