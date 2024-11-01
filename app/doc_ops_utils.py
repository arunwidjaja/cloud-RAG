from imports import *

# Local Modules
import config
import utils


def delete_uploads(file_list: List) -> List:
    """
    Deletes documents from the uploads folder (not from the DB)
    """
    document_path = utils.get_env_paths()['DOCS']
    deleted_uploads = []
    print(f"Clearing selected uploads from: {document_path}")
    for file_path in file_list:
        try:
            os.remove(file_path)
            deleted_upload = utils.extract_file_name(file_path)
            deleted_uploads.append(deleted_upload)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')
    return deleted_uploads


def delete_all_uploads() -> List:
    document_path = utils.get_env_paths()['DOCS']
    all_uploads = [str(file) for file in Path(
        document_path).rglob('*') if file.is_file()]
    return delete_uploads(all_uploads)


def archive_uploads(file_list: List) -> List:
    """
    Moves uploads to the archive folder.
    """
    archive_path = utils.get_env_paths()['ARCHIVE']
    archived_uploads = []
    print(f"Archiving uploads to: {archive_path}")
    for file_path in file_list:
        try:
            shutil.move(file_path, archive_path)
            archived_upload = utils.extract_file_name(file_path)
            archived_uploads.append(archived_upload)
        except Exception as e:
            print(f'Failed to archive {file_path}. Reason: {e}')
    return archived_uploads


def archive_all_uploads() -> List:
    document_path = utils.get_env_paths()['DOCS']
    all_uploads = [str(file) for file in Path(
        document_path).rglob('*') if file.is_file()]
    return archive_uploads(all_uploads)


def get_uploads_list() -> List:
    """
    Gets a list of the uploaded files.
    """
    pending_files_path = utils.get_env_paths()['DOCS']
    print(f"Reading uploads from: {pending_files_path}")
    uploads_list = []
    for f in pending_files_path.iterdir():
        print(f"Found upload: {f}")
        if f.is_file():
            uploads_list.append(str(f))
    return uploads_list
