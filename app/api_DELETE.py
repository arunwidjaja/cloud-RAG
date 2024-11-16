from imports import *

# Local Modules
from globals import get_database
import doc_ops_utils
import db_ops

router = APIRouter()


@router.delete("/delete_uploads")
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


@router.delete("/delete_collection")
async def delete_collection(collection: List[str] = Query(...)):
    """
    Deletes the collection from the database
    """
    print("API CALL: delete_collection")
    if collection is None or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")

    try:
        database = get_database()
        # Collection can only have one element in it
        deleted_collection = db_ops.delete_collection(
            database, collection[0])
        return deleted_collection
    except Exception as e:
        raise e


@router.delete("/delete_files")
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
