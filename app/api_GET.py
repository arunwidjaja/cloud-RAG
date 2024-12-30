from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from pathlib import Path
from typing import List

import json
import os
import zipfile

# Local Modules
from api_dependencies import DatabaseManager, get_db_instance
from api_MODELS import *
from paths import get_paths
from summarize import summarize_map_reduce

import db_ops_utils
import db_ops
import doc_ops_utils
import utils


router = APIRouter()


@router.get("/download_files")
async def download_files(
        hashes: List[str] = Query(...),
        collection: List[str] = Query(...),
        db: DatabaseManager = Depends(get_db_instance)
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


@router.get("/initiate_push_to_db")
async def initiate_push_to_db(
    collection: List[str] = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Updates the database with all the uploaded documents
    """
    print("API CALL: push_files_to_database")
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        # database = get_database()
        database = db.get_db()
        user = db.get_uuid()
        # Collection can only have one element in it
        pushed_files = await db_ops.push_to_database(
            db=database,
            collection=collection[0],
            user_id=user
        )
        return pushed_files
    except Exception as e:
        raise Exception(f"Exception occured when pushing files: {e}")


@router.get("/summary")
async def summarize(
    hashes: List[str] = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        # database = get_database()
        database = db.get_db()
        summary = await summarize_map_reduce(
            db=database,
            doc_list=hashes,
            preset='GENERAL'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@router.get("/theme")
async def analyze_theme(
    hashes: List[str] = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Generates a map-reduce summary of the specified files.
    """
    print("API CALL: summarize_files")
    try:
        # database = get_database()
        database = db.get_db()
        summary = await summarize_map_reduce(
            db=database,
            doc_list=hashes,
            preset='THEMES_INTERVIEWS_1'
        )
        return summary
    except Exception as e:
        raise Exception(f"Exception occurred when generating summary: {e}")


@router.get("/collections")
async def get_collections(
    db: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Gets a list of all the collections in the database
    """
    print("API CALL: get_db_files_metadata")
    try:
        # database = get_database()
        database = db.get_db()
        collections = db_ops_utils.get_all_collections_names(database)
        return collections
    except Exception as e:
        raise Exception(
            f"Exception occured when getting collections list: {e}")


@router.get("/saved_chats")
async def get_saved_chats(
    db: DatabaseManager = Depends(get_db_instance)
):
    """
    Gets the JSON data containing all saved chats
    """
    print("API CALL: get_saved_chats")
    all_chats: List[ChatModel] = []
    try:
        chats_path = get_paths().CHATS
        for chat_name in os.listdir(chats_path):
            chat_path = Path(chats_path) / chat_name
            with open(chat_path, 'r') as chat:
                json_content: ChatModel = json.load(chat)
                all_chats.append(json_content)
        return all_chats
    except Exception as e:
        raise Exception(f"Exception occurred when getting chat history: {e}")


@router.get("/db_files_metadata")
async def get_db_files_metadata(
    collections: List[str] = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
):
    """
    Gets the metadata of all unique files in the database for the given collections
    """
    print("API CALL: get_db_files_metadata")
    try:
        # database = get_database()
        database = db.get_db()
        file_metadata = db_ops_utils.get_db_files_metadata(
            database, collections)
        return JSONResponse(content=file_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting file list: {e}")


@router.get("/uploads_metadata")
async def get_uploads_metadata(
        is_attachment: bool = Query(False),
        db: DatabaseManager = Depends(get_db_instance)
):
    """
    Gets the metadata of all uploads or attachments.
    is_attachment determines whether to fetch uploads or attachments.
    """
    print(f"Fetching metadata of {
          "attachments." if is_attachment else "uploads."}")
    try:
        uploads_metadata = doc_ops_utils.get_uploads_metadata(is_attachment)
        return JSONResponse(content=uploads_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when fetching uploads: {e}")
