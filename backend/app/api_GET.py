from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from typing import List

import os
import zipfile

# Local Modules
from api_MODELS import *
from chats import get_chats
from collection_utils import format_name, unformat_name
from database_manager import DatabaseManager, get_db_instance
from paths import get_paths
from summarize import summarize_map_reduce

import database_utils
import document_utils
import utils


router = APIRouter()


@router.get("/download_files")
async def download_files(
        hashes: List[str] = Query(...),
        collection: List[str] = Query(...),
        dbm: DatabaseManager = Depends(get_db_instance)
):
    """
    Downloads the specified files and returns a list of the downloaded files.
    """
    print("API CALL: download_files")
    if not hashes:
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        # Get the hashes of the files in the archive
        archive_path = get_paths().ARCHIVE
        archive_hash = utils.get_hash_dir(archive_path)

        # Convert hashes to paths
        file_paths: List[str] = []
        for hash in hashes:
            file_path = archive_hash.get(hash)
            if file_path:
                file_paths.append(file_path)

        # Validate paths
        for file_path in file_paths:
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")

        # For single file:
        if len(file_paths) == 1:
            file_path = file_paths[0]
            file_name = os.path.basename(file_path)
            return FileResponse(
                path=file_path,
                media_type='application/octet-stream',
                headers={
                    'Content-Disposition': f'attachment; filename={file_name}',
                    'Access-Control-Expose-Headers': 'Content-Disposition'
                }
            )

        # For multiple files:
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for file_path in file_paths:
                zf.write(file_path, os.path.basename(file_path))

        zip_buffer.seek(0)
        zip_name = os.path.basename(file_paths[0])
        zip_name = os.path.splitext(zip_name)[0]
        return StreamingResponse(
            zip_buffer,
            media_type='application/zip',
            headers={
                'Content-Disposition': f'attachment; filename={zip_name}.zip',
                'Access-Control-Expose-Headers': 'Content-Disposition'
            }
        )
    except Exception as e:
        raise Exception(f"Exception occurred when downloading files: {e}")


# @router.get("/initiate_push_to_db")
# async def push_db(
#     collections: List[str] = Query(...),
#     dbm: DatabaseManager = Depends(get_db_instance)
# ) -> List[str]:
#     """
#     Updates the database with all the uploaded documents
#     """
#     print("API CALL: push_files_to_database")
#     if not collections or len(collections) != 1:
#         raise HTTPException(
#             status_code=422, detail="Invalid or missing collection parameter.")
#     try:
#         uuid = dbm.get_uuid()
#         formatted_collection_name = format_name(collections, uuid)[0]

#         pushed_files = await database_operations.push_db(
#             dbm=dbm,
#             collection=formatted_collection_name,
#         )
#         return pushed_files
#     except Exception as e:
#         raise Exception(f"Exception occured when pushing files: {e}")


@router.get("/summary")
async def summarize(
    hashes: List[str] = Query(...),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        # database = get_database()
        uuid = dbm.get_uuid()
        summary = await summarize_map_reduce(
            dbm=dbm,
            uuid=uuid,
            doc_list=hashes,
            preset='GENERAL'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@router.get("/theme")
async def analyze_theme(
    hashes: List[str] = Query(...),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        # database = get_database()
        uuid = dbm.get_uuid()
        summary = await summarize_map_reduce(
            dbm=dbm,
            uuid=uuid,
            doc_list=hashes,
            preset='THEMES_INTERVIEWS_1'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@router.get("/collections")
async def get_collections(
    dbm: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Gets a list of all the collection names in the database.
    """
    print("API CALL: get_db_files_metadata")
    try:
        user_collections = dbm.get_user_collections()
        user_collections = unformat_name(user_collections)
        return user_collections
    except Exception as e:
        raise Exception(
            f"Exception occured when getting collections list: {e}")


@router.get("/saved_chats")
async def get_saved_chats(
    dbm: DatabaseManager = Depends(get_db_instance)
) -> List[ChatModel]:
    """
    Gets the JSON data containing all saved chats
    """
    print("API CALL: get_saved_chats")

    try:
        chats = get_chats(dbm)
        return chats
    except Exception as e:
        raise Exception(f"Exception occurred when getting chat history: {e}")


@router.get("/db_files_metadata")
async def get_db_files_metadata(
    collections: List[str] = Query(...),
    dbm: DatabaseManager = Depends(get_db_instance)
):
    """
    Gets the metadata of all unique files in the database for the given collections
    """
    print("API CALL: get_db_files_metadata")
    try:
        uuid = dbm.get_uuid()
        formatted_collections = format_name(collections, uuid)

        file_metadata = database_utils.get_files_metadata(
            dbm=dbm,
            collection_names=formatted_collections
        )
        return JSONResponse(content=file_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@router.get("/uploads_metadata")
async def get_uploads_metadata(
        is_attachment: bool = Query(False),
        dbm: DatabaseManager = Depends(get_db_instance)
):
    """
    Gets the metadata of all uploads or attachments.
    is_attachment determines whether to fetch uploads or attachments.
    """
    print(f"Fetching metadata of {
          "attachments." if is_attachment else "uploads."}")
    try:
        uploads_metadata = document_utils.get_uploads_metadata(is_attachment)
        return JSONResponse(content=uploads_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when fetching uploads: {e}")
