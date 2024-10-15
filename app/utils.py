from langchain_chroma import Chroma
import re
import os
import shutil
from typing import List

import config
from query_data import ResponseContext


def get_db_file_names(db: Chroma, file_name_only=False) -> List:
    """
    Gets a list of all unique source files in the Chroma DB.
    """
    collection = db._collection
    results = collection.get(include=["metadatas"])

    # Extract unique source files
    file_set = set()
    for metadata in results['metadatas']:
        if 'source' in metadata:
            file_set.add(metadata['source'])
    file_list = sorted(list(file_set))

    # Extract file name if file_name_only is True
    if (file_name_only):
        for i, file in enumerate(file_list):
            file_trim = file.split('\\')[-1]  # gets file name
            file_trim = re.sub(r':\d+:\d+$', '', file_trim)  # trims off tags
            file_name_only[i] = file_trim

    # Print the unique source files
    print("Source files:")
    for file in file_list:
        print(file)
    return file_list


def delete_db_files(db: Chroma, file_list: List) -> List:
    # TODO: Obtain all IDs corresponding to the files given in file_list
    # Pass those IDs to delete function

    collection = db._collection
    for file in file_list:
        file_metadata = collection.get(
            where={"source": file},
            include=["metadatas", "documents"]
        )
        ids_to_delete = file_metadata['ids']

        # Delete job needs to be split into batches
        # Chroma allows a maximum number of embeddings to be modified at once
        if ids_to_delete:
            for i in range(0, len(ids_to_delete), config.MAX_BATCH_SIZE):
                deletion_batch = ids_to_delete[i: i+config.MAX_BATCH_SIZE]
                collection.delete(deletion_batch)
        else:
            print("No documents found from the specified source.")
    return file_list


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
    # Source path (the chroma folder in your machine or docker container image)
    src_path = config.PATH_CHROMA_LOCAL

    # Destination path where chroma should be copied
    dest_path = config.PATH_CHROMA_TEMP

    # Check if the chroma folder exists in the destination directory
    if os.path.exists(dest_path):
        # Delete the existing chroma folder in the destination
        shutil.rmtree(dest_path)
        print(f"Deleted existing folder: {dest_path}")

    # Copy the chroma folder from source to destination
    shutil.copytree(src_path, dest_path)
    print(f"Copied {src_path} to {dest_path}")


def main():
    print("running utils.py")


if __name__ == "__main__":
    main()
