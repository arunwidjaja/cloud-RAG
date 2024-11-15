from imports import *

# Local Modules
from globals import get_database
from summarize import summarize_map_reduce
import doc_ops_utils
import db_ops_utils
import db_ops


router = APIRouter()


@router.get("/download_files")
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


@router.get("/initiate_push_to_db")
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


@router.get("/summary")
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


@router.get("/theme")
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
async def get_db_files_metadata(collections: List[str] = Query(...)):
    """
    Gets the metadata of all unique files in the database for the given collections
    """
    print("API CALL: get_db_files_metadata")
    try:
        database = get_database()
        file_metadata = db_ops_utils.get_db_files_metadata(
            database, collections)
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
