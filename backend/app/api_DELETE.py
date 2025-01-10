# External Modules
from fastapi import APIRouter, Depends, HTTPException, Query

# Local Modules
from api_MODELS import *
from collection_utils import format_name
from database_manager import DatabaseManager, get_db_instance
from paths import delete_user_paths

import authentication_manager
import chats
import database_operations
import document_utils


router = APIRouter()


@router.delete("/delete_account")
async def delete_account(
    credentials: CredentialsModel,
    dbm: DatabaseManager = Depends(get_db_instance)
) -> bool:
    try:
        auth = authentication_manager.AuthenticationManager()
        user_id = auth.validate_user(
            username=credentials.email,
            password=credentials.pwd
        )
        if user_id:
            # Delete user from authentication database
            auth.delete_user(
                username=credentials.email,
                password=credentials.pwd)

            # Delete user's collections
            user_cols = dbm.get_user_collections()
            for col in user_cols:
                database_operations.delete_collection(dbm, col)

            # Delete user's data
            delete_user_paths(user_id)
            return True
        else:
            return False
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete user: {str(e)}"
        )


@router.delete("/delete_chat")
async def delete_chat(
    chat_id: str = Query(...),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Deletes stored chats
    """
    try:
        deleted_chat = chats.delete_chat(dbm, chat_id)
        return deleted_chat
    except Exception as e:
        raise e


@router.delete("/delete_uploads")
async def delete_uploads(
    hashes: List[str] = Query(...),
    is_attachment: bool = Query(False),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Delete the list of uploads from the uploads folder
    """
    if not hashes:
        raise HTTPException(
            status_code=422, detail="Invalid or missing hashes parameter.")
    try:
        deleted_files = document_utils.delete_uploads(hashes, is_attachment)
        return deleted_files
    except Exception as e:
        raise e


@router.delete("/delete_collection")
async def delete_collection(
    collection: List[str] = Query(...),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Deletes the collection from the database
    """
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")

    try:
        uuid = dbm.get_uuid()
        formatted_collection = format_name(collection, uuid)[0]

        # Collection can only have one element in it
        deleted_collection = database_operations.delete_collection(
            dbm,
            collection_name=formatted_collection
        )
        return deleted_collection
    except Exception as e:
        raise e


@router.delete("/delete_files")
async def delete_files(
        hashes: List[str] = Query(...),
        collection: List[str] = Query(...),
        dbm: DatabaseManager = Depends(get_db_instance)
) -> List[str]:
    """
    Delete the list of files from the Chroma DB
    """
    if not collection or len(collection) != 1:
        raise HTTPException(
            status_code=422, detail="Invalid or missing collection parameter.")
    try:
        uuid = dbm.get_uuid()
        formatted_collection = format_name(collection, uuid)[0]

        deleted_files = database_operations.delete_files(
            dbm,
            hashes,
            collection_name=formatted_collection
        )
        return deleted_files
    except Exception as e:
        raise e
