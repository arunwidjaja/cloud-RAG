from imports import *

# Local Modules
from api_dependencies import get_db
from api_MODELS import *
import doc_ops_utils
import db_ops
import config
import utils
import authentication
import delete_user_data

router = APIRouter()


@router.delete("/delete_account")
async def delete_account(credentials: CredentialsModel, db=Depends(get_db)):
    try:
        auth = authentication.UserAuth()
        user_id = auth.validate_user(
            username=credentials.email,
            password=credentials.pwd
        )
        if user_id:
            auth.delete_user(
                username=credentials.email,
                password=credentials.pwd)
            # delete_user_data.delete_user_data(user_id)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register user: {str(e)}"
        )


@router.delete("/delete_chat")
async def delete_chat(chat_id: str = Query(...), db=Depends(get_db)):
    """
    Deletes stored chats
    """
    chats_path = utils.get_env_user_paths()['CHATS']
    chat_path = chats_path / f"{chat_id}.json"

    if not os.path.exists(chat_path):
        return False
    try:
        if os.path.isfile(chat_path):
            os.remove(chat_path)
            return True
    except Exception as e:
        raise e


@router.delete("/delete_uploads")
async def delete_uploads(
    hashes: List[str] = Query(...),
    is_attachment=Query(False),
    db=Depends(get_db)
):
    """
    Delete the list of uploads from the uploads folder
    """
    if hashes is None or not isinstance(hashes, list):
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")

    try:
        deleted_files = doc_ops_utils.delete_uploads(hashes, is_attachment)
        return deleted_files
    except Exception as e:
        raise e


@router.delete("/delete_collection")
async def delete_collection(collection: List[str] = Query(...), db=Depends(get_db)):
    """
    Deletes the collection from the database
    """
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")

    try:
        # database = get_database()
        database = db
        # Collection can only have one element in it
        deleted_collection = db_ops.delete_collection(
            database, collection[0])
        return deleted_collection
    except Exception as e:
        raise e


@router.delete("/delete_files")
async def delete_files(hashes: List[str] = Query(...), collection: List[str] = Query(...), db=Depends(get_db)):
    """
    Delete the list of files from the Chroma DB
    """
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        # database = get_database()
        database = db
        # Collection can only have one element in it
        deleted_files = db_ops.delete_db_files(
            database,
            hashes,
            collection_name=collection[0]
        )
        return deleted_files
    except Exception as e:
        raise e
