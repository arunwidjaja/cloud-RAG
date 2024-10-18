from langchain_chroma import Chroma
import re
import os
import shutil
from pathlib import Path
from typing import List

# Modules
import config
from query_data import ResponseContext

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


def get_db_file_names(db: Chroma, file_name_only=False) -> List:
    """
    Gets a list of all unique source files in the given DB.
    """
    collection = db._collection
    results = collection.get(include=["metadatas"])

    # Extract unique source file names
    file_set = set()
    for metadata in results['metadatas']:
        if 'source' in metadata:
            file_set.add(metadata['source'])
    file_list = sorted(list(file_set))

    # Extracts file names (without path) if file_name_only is True
    if (file_name_only):
        for i, file in enumerate(file_list):
            file_trim = file.split('\\')[-1]  # gets file name
            file_trim = re.sub(r':\d+:\d+$', '', file_trim)  # trims off tags
            file_name_only[i] = file_trim

    return file_list


def get_uploads_list() -> List:
    """
    Gets a list of the uploaded files.
    """
    pending_files_path = get_env_paths()['DOCS']
    uploads_list = []
    for f in pending_files_path.iterdir():
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


def build_response_string(response: str, context: ResponseContext) -> str:
    """
    Accepts a Tuple containing the LLM response and the relevant context.
    The LLM response is a string.
    The relevant context is a List of Tuple, each with the context text and the file path.
    """
    response_string = f"{response}\n"

    # iterate through each context and append the actual text and the file name to the response string
    for i in range(len(context)):
        context_current = context[i]

        context_current_text = context_current[0].replace("\n", " ")
        file_name = context_current[1].split('\\')[-1]

        context_summary = f"Source #{
            i + 1}: {file_name}\n...{context_current_text}...\n"
        response_string = "\n".join([response_string, context_summary])
    return response_string


def mirror_directory(src_path: str, dest_path: str):
    """
    Deletes dest_path. Copies src_path to dest_path. Only works if they are on the same machine.
    """
    src_path = config.PATH_CHROMA_LOCAL
    dest_path = config.PATH_CHROMA_TEMP

    # Delete the dest_path
    if os.path.exists(dest_path):
        print(f"Deleting existing folder: {dest_path}")
        shutil.rmtree(dest_path)
    # Copies src_path
    if os.path.exists(src_path):
        print(f"Copying {src_path} to {dest_path}")
        shutil.copytree(src_path, dest_path)


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
