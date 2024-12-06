from imports import *

# Local Modules
from api_dependencies import get_db
from api_MODELS import *
from query_data import query_rag
import config
import db_ops
import utils
import authentication

router = APIRouter()


@router.post("/login")
async def login(credentials: CredentialsModel):
    try:
        auth = authentication.UserAuth()
        return auth.validate_user(username=credentials.email, password=credentials.pwd)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to login: {str(e)}"
        )


@router.post("/register")
async def register(credentials: CredentialsModel):
    try:
        auth = authentication.UserAuth()
        return auth.register_user(username=credentials.email, password=credentials.pwd)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register user: {str(e)}"
        )


@router.post("/save_chat")
async def save_chat(chat: ChatModel, db=Depends(get_db)):
    try:
        chats_path = utils.get_env_paths()['CHATS']

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
async def create_collection(request: CollectionModel, db=Depends(get_db)):
    """
    Create a new collection in the database
    """
    print("API CALL: create_collection")
    try:
        # database = get_database()
        database = db
        collection_name = request.collection_name
        ef = request.embedding_function
        collection = db_ops.add_persistent_collection(
            database, collection_name, ef)
        return collection
    except Exception as e:
        raise Exception(f"Exception occurred when creating a collection: {e}")


@router.post("/submit_query")
async def submit_query(request: QueryModel, db=Depends(get_db)):
    """
    Send query to LLM and retrieve the response
    """
    print("API CALL: submit_query")
    # database = get_database()
    database = db
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
async def upload_documents(files: List[UploadFile] = File(...), db=Depends(get_db)):
    print(f"API CALL: upload_documents")
    saved_files = []
    uploads_path = utils.get_env_paths()['UPLOADS']

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
