# External Modules
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import os
import shutil

# Local Modules
from api_MODELS import *
from database_manager import DatabaseManager, get_db_instance
from collection_utils import format_name
from paths import get_paths
from query_data import stream_rag_response

import authentication_manager
import chats
import database_operations
import utils

router = APIRouter()


@router.post("/login")
async def login(
    credentials: CredentialsModel
):
    try:
        auth = authentication_manager.AuthenticationManager()
        success = auth.validate_user(
            username=credentials.username,
            password=credentials.pwd
        )
        return success
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to login: {str(e)}"
        )


@router.post("/register")
async def register(
    credentials: CredentialsModel,
    background_tasks: BackgroundTasks
):
    try:
        auth = authentication_manager.AuthenticationManager()
        return auth.register_user(
            username=credentials.username,
            email=credentials.email,
            password=credentials.pwd,
            background_tasks=background_tasks)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register user: {str(e)}"
        )


@router.post("/resend_otp")
async def resent_otp(email: str):
    try:
        auth = authentication_manager.AuthenticationManager()
        auth.update_otp(email)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to resend OTP: {str(e)}"
        )


@router.post("/verify_otp")
async def verify_otp(
    otp: OTPModel
) -> bool:
    try:
        auth = authentication_manager.AuthenticationManager()
        return await auth.verify_otp(
            email=otp.email,
            otp=otp.otp)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify OTP: {str(e)}"
        )


@router.post("/save_chat")
async def save_chat(
    chat: ChatModel,
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    try:
        saved_chat = chats.save_chat(dbm, chat)
        return saved_chat
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save chat: {str(e)}"
        )


@router.post("/create_collection")
async def create_collection(
    request: CollectionModel,
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str:
    """
    Create a new collection in the database
    """
    print("API CALL: create_collection")
    try:
        uuid = dbm.get_uuid()
        col = request.collection_name
        ef = request.embedding_function

        # format collection name before creating it
        formatted_collection = format_name([col], uuid)[0]

        collection = database_operations.create_collection(
            dbm=dbm,
            collection_name=formatted_collection,
            embedding_function=ef
        )

        # if successful, return the original (unformatted) collection name
        if (collection):
            return col
        else:
            return ""

    except Exception as e:
        raise Exception(f"Exception occurred when creating a collection: {e}")


@router.post("/stream_query")
async def stream_query(
    request: QueryModel,
    dbm: DatabaseManager = Depends(get_db_instance)
):
    uuid = dbm.get_uuid()
    return StreamingResponse(
        stream_rag_response(
            dbm=dbm,
            uuid=uuid,
            query_text=request.query_text,
            chat=request.chat,
            query_type=request.query_type
        ),
        media_type='text/event-stream'
    )


@router.post("/upload_documents")
async def upload_documents(
    files: List[UploadFile] = File(...),
    is_attachment: bool = Query(False),
    dbm: DatabaseManager = Depends(get_db_instance)
):
    """
    Uploads files to user's data folders.
    is_attachment determines whether to send them to uploads or attachments folder.
    """
    print(f"Files received:\n{[(file.filename) for file in files]}")
    print(f"Uploading documents as {
          "attachments." if is_attachment else "uploads."}")
    saved_files: List[str] = []
    uploads_path = (get_paths().ATTACHMENTS
                    if is_attachment
                    else
                    get_paths().UPLOADS)

    for file in files:
        file_path = os.path.join(str(uploads_path), str(file.filename))

        try:
            # Save the file to the specified directory
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(utils.extract_file_name(file_path))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload {
                                file.filename}: {str(e)}")
    return saved_files
