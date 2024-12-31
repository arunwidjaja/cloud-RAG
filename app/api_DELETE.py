# External Modules
from fastapi import APIRouter, Depends, HTTPException, Query
import os

# Local Modules
from api_dependencies import DatabaseManager, get_db_instance
from api_MODELS import *
from db_collections import format_name
from paths import get_paths

import authentication
import db_ops
import doc_ops_utils


router = APIRouter()


@router.delete("/delete_account")
async def delete_account(
    credentials: CredentialsModel,
    db: DatabaseManager = Depends(get_db_instance)
) -> None:
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
async def delete_chat(
    chat_id: str = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
) -> bool:
    """
    Deletes stored chats
    """
    chats_path = get_paths().CHATS
    chat_path = chats_path / f"{chat_id}.json"

    if not os.path.exists(chat_path):
        return False
    try:
        if os.path.isfile(chat_path):
            os.remove(chat_path)
            return True
    except Exception as e:
        raise e
    return False


@router.delete("/delete_uploads")
async def delete_uploads(
    hashes: List[str] = Query(...),
    is_attachment: bool = Query(False),
    db: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Delete the list of uploads from the uploads folder
    """
    if not hashes:
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")
    try:
        deleted_files = doc_ops_utils.delete_uploads(hashes, is_attachment)
        return deleted_files
    except Exception as e:
        raise e


@router.delete("/delete_collection")
async def delete_collection(
    collection: List[str] = Query(...),
    db: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Deletes the collection from the database
    """
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")

    try:
        database = db.get_db()
        uuid = db.get_uuid()
        formatted_collection = format_name(collection, uuid)[0]

        # Collection can only have one element in it
        deleted_collection = db_ops.delete_collection(
            db=database,
            collection_name=formatted_collection
        )
        return deleted_collection
    except Exception as e:
        raise e


@router.delete("/delete_files")
async def delete_files(
        hashes: List[str] = Query(...),
        collection: List[str] = Query(...),
        db: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Delete the list of files from the Chroma DB
    """
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        database = db.get_db()
        uuid = db.get_uuid()
        formatted_collection = format_name(collection, uuid)[0]

        deleted_files = db_ops.delete_files(
            database,
            hashes,
            collection_name=formatted_collection
        )
        return deleted_files
    except Exception as e:
        raise e
