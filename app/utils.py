from langchain_chroma import Chroma
import re
import os
import shutil
from pathlib import Path
from typing import List

# Modules
import config

# TODO: Implement the condition for S3


def get_env_paths() -> dict[str, Path]:
    """
    Sets environment-sensitive paths/values and returns them in a dictionary.
    """
    keys = ['DB', 'DOCS']
    dynamic_env_values = dict.fromkeys(keys, None)

    document_paths = {
        "LOCAL": config.PATH_DOCUMENTS_LOCAL,
        "TEMP": config.PATH_DOCUMENTS_TEMP
    }
    chroma_paths = {
        "LOCAL": config.PATH_CHROMA_LOCAL,
        "TEMP": config.PATH_CHROMA_TEMP
    }

    if 'var' in str(config.CURRENT_PATH):
        dynamic_env_values['DB'] = chroma_paths['TEMP']
        dynamic_env_values['DOCS'] = document_paths['TEMP']
    else:
        dynamic_env_values['DB'] = chroma_paths['LOCAL']
        dynamic_env_values['DOCS'] = document_paths['LOCAL']

    return dynamic_env_values


def extract_file_name(paths: List[str] | str) -> List[str] | str:
    """
    Converts extract the file name from the path or list of paths
    """
    file_name_list = []

    # convert strings to a list first
    if isinstance(paths, str):
        path_list = [paths]

    for path in path_list:
        path_trim = path.split('\\')[-1]  # gets file name
        path_trim = re.sub(r':\d+:\d+$', '', path_trim)  # trims off tags
        file_name_list.append(path_trim)

    if isinstance(paths, str):
        return file_name_list[0]
    return file_name_list


def get_db_file_names(db: Chroma, file_name_only=False) -> List:
    """
    Gets a list of all unique source files in the given DB.
    """
    collection = db._collection
    results = collection.get(include=["metadatas"])

    # Extract unique source file names
    path_set = set()
    for metadata in results['metadatas']:
        if 'source' in metadata:
            path_set.add(metadata['source'])
    path_list = sorted(list(path_set))

    # Extracts file names (without path) if file_name_only is True
    if (file_name_only):
        return extract_file_name(path_list)
    return path_list


def get_uploads_list() -> List:
    """
    Gets a list of the uploaded files.
    """
    pending_files_path = get_env_paths()['DOCS']
    print(f"Reading uploads from: {pending_files_path}")
    uploads_list = []
    for f in pending_files_path.iterdir():
        print(f"Found upload: {f}")
        if f.is_file():
            uploads_list.append(str(f))
    return uploads_list


def get_folder_size(path: str, print_all=False):
    """
    Gets size of given folder.
    If print_all is True, prints sizes of all files
    """
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                size_current = os.path.getsize(fp)
                total_size += size_current
                if print_all:
                    print(f"Size of {fp}: {size_current}")
    return total_size


def mirror_directory(src_path: str, dest_path: str):
    """
    Deletes dest_path. Copies src_path to dest_path.
    """
    if os.path.exists(dest_path):
        print(f"Deleting existing destination folder: {dest_path}")
        shutil.rmtree(dest_path)

    print(f"Copying {src_path} to {dest_path}")
    os.makedirs(dest_path)
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def copy_directory(src_path: str, dest_path: str):
    """
    Copies src_path to dest_path.
    """
    if not os.path.exists(dest_path):
        print(f"{dest_path} doesn't exist. Creating it now...")
        os.makedirs(dest_path)
    print(f"Copying {src_path} to {dest_path}")
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def writeIDs(db: Chroma, file_name):
    """
    Writes all IDs of the database to file_name
    """
    metadata = db._collection.get()
    ids = "\n".join(metadata["ids"])
    with open(file_name, 'w') as file:
        file.write(ids)


def main():
    print("running utils.py")


if __name__ == "__main__":
    main()
