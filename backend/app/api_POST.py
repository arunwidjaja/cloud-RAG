# External Modules
from asyncio import Task
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import asyncio
import os
import shutil

# Local Modules
from api_MODELS import *
from audio import transcribe_audio
from database_manager import DatabaseManager, get_db_instance
from document_processor import DocumentHandler, get_document_handler
from collection_utils import format_name
from paths import get_paths
from query_data import stream_rag_response

import authentication_manager
import chats
import database_operations

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
    files: List[UploadFile] = File(...),  # List of files uploaded by the user
    file_ids: List[str] = Form(...),  # List of temporary file IDs for tracking
    collection: str = Form(...),  # Collection to push to
    is_attachment: bool = Query(False),
    dbm: DatabaseManager = Depends(get_db_instance),
    doc_handler: DocumentHandler = Depends(get_document_handler)
) -> List[str]:
    """
    Uploads files to user's data folders.
    is_attachment determines whether to send them to uploads or attachments folder.
    """
    tasks: List[Task[str]] = []

    uuid = dbm.get_uuid()
    coll = format_name([collection], uuid)[0]

    if is_attachment:
        uploads_path = get_paths().ATTACHMENTS
        print("Uploading docs as uploads.")
    else:
        uploads_path = get_paths().UPLOADS
        print("Uploading docs as attachments.")

    for file, id in zip(files, file_ids):
        print(f"Processing file {file.filename}: {id}")

        # Save file to disk
        file_path = os.path.join(str(uploads_path), str(file.filename))
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Add file to async job
        task = asyncio.create_task(
            doc_handler.process_document(
                dbm=dbm,
                collection=coll,
                file_path=file_path,
                file_id=id
            )
        )
        tasks.append(task)

    # Process files concurrently
    processed_files = await asyncio.gather(*tasks)

    print(f"All files processed!")
    return processed_files


@router.post("/stt")
async def parse_audio(
    audio: UploadFile = File(...),
    dbm: DatabaseManager = Depends(get_db_instance)
) -> str | None:
    try:
        # Save file to disk
        if audio.filename:
            content = await audio.read()
            transcription = transcribe_audio(content)
            return transcription
            # audio_path = audios_path / audio.filename

            # async with aiofiles.open(audio_path, "wb") as out_file:
            #     content = await audio.read()
            #     await out_file.write(content)
            # transcription = transcribe_audio(audio_path)
            # return transcription
    except Exception as e:
        print(f"Parse audio error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse chat: {str(e)}"
        )
