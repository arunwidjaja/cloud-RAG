# External Modules
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import json
import os
import shutil

# Local Modules
from api_dependencies import DatabaseManager, get_db_instance
from api_MODELS import *
from db_collections import format_name, unformat_name
from paths import get_paths
from query_data import stream_rag_response

import authentication
import db_ops
import utils

router = APIRouter()


@router.post("/login")
async def login(
    credentials: CredentialsModel
):
    try:
        auth = authentication.UserAuth()
        return auth.validate_user(username=credentials.email, password=credentials.pwd)
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
        auth = authentication.UserAuth()
        return auth.register_user(
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
        auth = authentication.UserAuth()
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
        auth = authentication.UserAuth()
        return await auth.verify_email(
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
    db: DatabaseManager = Depends(get_db_instance)
):
    try:
        chats_path = get_paths().CHATS

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
async def create_collection(
    request: CollectionModel,
    db: DatabaseManager = Depends(get_db_instance)
):
    """
    Create a new collection in the database
    """
    print("API CALL: create_collection")
    try:
        database = db.get_db()
        uuid = db.get_uuid()
        col = request.collection_name
        ef = request.embedding_function

        collection_name = format_name([col], uuid)[0]

        collection = db_ops.create_collection(
            db=database,
            collection_name=collection_name,
            embedding_function=ef
        )

        return unformat_name([collection])
    except Exception as e:
        raise Exception(f"Exception occurred when creating a collection: {e}")


@router.post("/stream_query")
async def stream_query(
    request: QueryModel,
    db: DatabaseManager = Depends(get_db_instance)
):
    database = db.get_db()
    uuid = db.get_uuid()
    return StreamingResponse(
        stream_rag_response(
            db=database,
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
    db: DatabaseManager = Depends(get_db_instance)
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
            print(f"Copying {file} to {file_path}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(utils.extract_file_name(file_path))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload {
                                file.filename}: {str(e)}")
    return saved_files
