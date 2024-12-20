from imports import *

# Local Modules
import config
import utils


def delete_uploads(file_hash_list: List) -> List:
    """
    Deletes documents from the uploads folder (not from the DB)

    Args:
        file_hash_list: a list of the hashes of the uploads that need to be deleted

    Returns:
        A list of names of deleted uploads
    """
    document_path = utils.get_env_user_paths()['UPLOADS']
    deleted_uploads = []

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


def delete_all_uploads() -> List:
    """
    Deletes all uploads.

    Returns:
        A list of names of deleted uploads
    """
    document_path = utils.get_env_user_paths()['UPLOADS']
    uploads_folder_hash = utils.get_hash_dir(document_path)
    return delete_uploads(uploads_folder_hash.keys())


def archive_uploads(file_list: List) -> List:
    """
    Moves uploads to the archive folder. Overwrites files with the same name.

    Args:
        file_list: A list of files to be moved

    Returns:
        A list of the moved files' names
    """
    archive_path = utils.get_env_user_paths()['ARCHIVE']
    archived_uploads = []
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


def archive_all_uploads() -> List:
    """
    Moves all uploads to the archive folder. Overwrites files with the same name.

    Returns:
        A list of the moved files' names
    """
    document_path = utils.get_env_user_paths()['UPLOADS']
    all_uploads = [str(file) for file in Path(
        document_path).rglob('*') if file.is_file()]
    return archive_uploads(all_uploads)


def get_uploads_metadata() -> List[dict]:
    """
    Gets the metadata of all the uploads.

    Returns:
        A list of dictionaries containing the file name, hash, and word count
    """
    uploads_folder_path = utils.get_env_user_paths()['UPLOADS']
    uploads_metadata = []
    for f in uploads_folder_path.iterdir():
        if f.is_file():
            current_upload_metadata = dict.fromkeys(
                ['name', 'hash', 'word_count'])
            name = os.path.basename(str(f))
            hash = utils.get_hash(f)
            word_count = utils.get_word_count(f)

            current_upload_metadata['name'] = name
            current_upload_metadata['hash'] = hash
            current_upload_metadata['word_count'] = word_count
            uploads_metadata.append(current_upload_metadata)
    return uploads_metadata
