# External Modules
from pathlib import Path
from typing import List

import os
import shutil
import tiktoken

# Local Modules
from custom_types import FileMetadata
from paths import get_paths

import config
import utils


def get_token_count(text: str, encoding: str = config.ENCODING_TOKENIZER) -> int:
    """
    Gets the token count of the input text

    Args:
        text: input text
        encoding: the encoding to use. Defaults to OpenAI's tokenizer encoding

    Returns:
        The number of tokens
    """
    encoder = tiktoken.get_encoding(encoding)
    tokens = encoder.encode(text)

    return len(tokens)


def delete_uploads(file_hash_list: List[str], is_attachment: bool = False) -> List[str]:
    """
    Deletes documents from the uploads folder (not from the DB)

    Args:
        file_hash_list: a list of the hashes of the uploads that need to be deleted
        is_attachment: if True, deletes attachments instead of uploads

    Returns:
        A list of names of deleted uploads
    """
    if (not is_attachment):
        document_path = get_paths().UPLOADS
    else:
        document_path = get_paths().ATTACHMENTS
    deleted_uploads: List[str] = []

    uploads_folder_hash = utils.get_hash_dir(document_path)

    for upload_hash in file_hash_list:
        upload_path = uploads_folder_hash.get(upload_hash)
        try:
            if upload_path is not None:
                os.remove(upload_path)
                deleted_upload = utils.extract_file_name(upload_path)
                deleted_uploads.append(deleted_upload)
        except Exception as e:
            print(f'Failed to delete {upload_path}. Reason: {e}')
    return deleted_uploads


def delete_all_uploads() -> List[str]:
    """
    Deletes all uploads.

    Returns:
        A list of names of deleted uploads
    """
    document_path = get_paths().UPLOADS
    uploads_folder_hash = utils.get_hash_dir(document_path)
    all_upload_hashes = list(uploads_folder_hash.keys())
    return delete_uploads(all_upload_hashes)


def archive_uploads(file_list: List[str]) -> List[str]:
    """
    Moves uploads to the archive folder. Overwrites files with the same name.

    Args:
        file_list: A list of files to be moved

    Returns:
        A list of the moved files' names
    """
    archive_path = get_paths().ARCHIVE
    archived_uploads: List[str] = []
    print(f"Archiving uploads to: {archive_path}")
    for file_path in file_list:
        try:
            dest_path = os.path.join(archive_path, os.path.basename(file_path))
            if os.path.exists(dest_path):
                os.remove(dest_path)
            shutil.move(file_path, archive_path)

            archived_upload = utils.extract_file_name(file_path)
            archived_uploads.append(archived_upload)
        except Exception as e:
            print(f'Failed to archive {file_path}. Reason: {e}')
    return archived_uploads


def archive_all_uploads() -> List[str]:
    """
    Moves all uploads to the archive folder. Overwrites files with the same name.

    Returns:
        A list of the moved files' names
    """
    document_path = get_paths().UPLOADS
    all_uploads = [str(file) for file in Path(
        document_path).rglob('*') if file.is_file()]
    return archive_uploads(all_uploads)


def get_uploads_metadata(is_attachment: bool = False) -> List[FileMetadata]:
    """
    Gets the metadata of all the uploads.

    Args:
        is_attachment: if set to True, will fetch attachments instead of uploads.

    Returns:
        A list of dictionaries containing the file name, hash, and word count.
    """
    document_path = get_paths().ATTACHMENTS if is_attachment else get_paths().UPLOADS

    uploads_metadata: List[FileMetadata] = []
    for f in document_path.iterdir():
        if f.is_file():
            current_upload_metadata: FileMetadata = {
                'name': '',
                'hash': '',
                'collection': '',
                'word_count': 0
            }
            name = os.path.basename(str(f))
            hash = utils.get_hash(str(f))
            # word_count = utils.get_word_count(f)
            word_count = 0

            current_upload_metadata['name'] = name
            current_upload_metadata['hash'] = hash
            current_upload_metadata['word_count'] = word_count
            uploads_metadata.append(current_upload_metadata)
    return uploads_metadata
