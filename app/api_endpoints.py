from imports import *


# Local Modules
from globals import get_database
import doc_ops_utils
import db_ops_utils

router = APIRouter()


@router.get("/collections")
async def get_collections():
    """
    Gets a list of all the collections in the database
    """
    print("API CALL: get_db_files_metadata")
    try:
        database = get_database()
        collections = db_ops_utils.get_all_collections_names(database)
        return collections
    except Exception as e:
        raise Exception(
            f"Exception occured when getting collections list: {e}")


@router.get("/db_files_metadata")
async def get_db_files_metadata():
    """
    Gets the metadata of all unique files in the database
    """
    print("API CALL: get_db_files_metadata")
    try:
        database = get_database()
        file_metadata = db_ops_utils.get_db_files_metadata(database)
        return JSONResponse(content=file_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@router.get("/uploads_metadata")
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
