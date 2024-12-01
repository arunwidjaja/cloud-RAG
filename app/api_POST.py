from imports import *

# Local Modules
from globals import get_database
from query_data import query_rag
import config
import db_ops
import utils
import authentication

router = APIRouter()


class QueryModel(BaseModel):
    query_text: str
    query_type: str


class CollectionModel(BaseModel):
    collection_name: str
    embedding_function: str


class FileModel(BaseModel):
    hash: str
    name: str
    collection: str
    word_countL: int = 0


class ContextModel(BaseModel):
    text: str
    file: FileModel


class MessageModel(BaseModel):
    id: str
    type: str = ""
    text: str
    context_list: List[ContextModel] = []


class ChatModel(BaseModel):
    id: str
    subject: str
    messages: List[MessageModel]


class CredentialsModel(BaseModel):
    email: str
    pwd: str


@router.post("/login")
async def login(credentials: CredentialsModel):
    try:
        auth = authentication.UserAuth()
        return auth.validate_login(username=credentials.email, password=credentials.pwd)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to login: {str(e)}"
        )


@router.post("/register")
async def register(credentials: CredentialsModel):
    try:
        print("Attempting to create UserAuth object")
        auth = authentication.UserAuth()
        print("Attempting to register user")
        return auth.register_user(username=credentials.email, password=credentials.pwd)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register user: {str(e)}"
        )


@router.post("/save_chat")
async def save_chat(chat: ChatModel):

    try:
        chats_path = utils.get_env_paths()['CHATS']
        # Create storage directory if it doesn't exist
        chats_path.mkdir(parents=True, exist_ok=True)

        # Create the file path using the chat ID
        file_path = chats_path / f"{chat.id}.json"

        # Convert the chat object to JSON and save it
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(
                chat.model_dump(),
                f,
                ensure_ascii=False,
                indent=2
            )

        return {
            "status": "success",
            "message": f"Chat saved successfully with ID: {chat.id}",
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save chat: {str(e)}"
        )


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

    context_list = []

    for context in contexts:
        file_model = FileModel(
            name=context['source'],
            hash=context['source_hash'],
            collection=context['collection']
        )
        context_model = ContextModel(
            file=file_model,
            text=context['context']
        )
        context_list.append(context_model)

    message_model = MessageModel(
        id=id,
        text=message,
        context_list=context_list
    )

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
