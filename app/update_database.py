# External packages
import argparse
from collections import Counter
from langchain_chroma import Chroma
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List
import os
import shutil

# Document Loaders
from langchain_community.document_loaders import TextLoader

# Modules
import utils
import config

document_path = utils.get_env_paths()['DOCS']


def load_documents():
    """
    Loads documents from the data folder
    """
    documents = []

    print(f"Searching for documents in: {document_path}")
    try:
        for file_path in document_path.iterdir():
            print(f"Found file: {file_path.name}")
            if (file_path.suffix in '.txt.md'):
                document = TextLoader(file_path, autodetect_encoding=True)
                documents.extend(document.load())
            else:
                print("Invalid format. Skipping this file.")
    except Exception as e:
        raise Exception(f"Exception occured when loading files.")

    return documents


def split_text(documents: List[Document]):
    """
    Splits Documents into chunks
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
        is_separator_regex=False
    )
    print(f"Splitting documents...")
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

    return chunks


def add_chunk_ids(chunks):
    """
    Adds IDs to the chunks you're trying to add. Returns a list of Chunks.
    The chunk IDs are formatted as "source:page number:chunk index".
    For example, data/testfile.pdf:5:3 would be the ID for the 3rd chunk of the 5th page of testfile.pdf
    """
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        # "source" is the path of the file
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")

        # if the chunk ID is the same as the last one, increment the index
        current_page_id = f"{source}:{page}"
        if current_page_id == last_page_id:
            current_chunk_index = current_chunk_index + 1
        else:
            current_chunk_index = 0

        if page is None:
            page = 0
        # create the chunk id
        # the chunk id is formatted as "{source}:{page number}:{chunk index}"
        chunk_id = f"{source}:{page}:{current_chunk_index}"
        chunk.metadata["id"] = chunk_id
        last_page_id = current_page_id
    return chunks


def save_to_chroma(db: Chroma, chunks: List[Document]):
    print("Saving chunks to Chroma DB...")
    chunks_with_ids = add_chunk_ids(chunks)
    # Dictionary of file names and the number of chunks they have
    chunk_counts = Counter([chunk.metadata.get("source") for chunk in chunks])

    # Get IDs of existing document chunks
    existing_items = db.get()
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing chunks in DB: {len(existing_ids)}")

    # Add documents that aren't already in the database (don't have a matching ID)
    new_chunks = []
    skipped_chunks = []
    skipped_documents = []
    added_documents = []
    last_document = ""

    for chunk in chunks_with_ids:
        current_document = f"{chunk.metadata["source"]}"
        # triggers when we move on to a new file (checks if file name is different)
        if (last_document != current_document):
            print(f"Currently processing {
                  chunk_counts[current_document]} chunks from: '{current_document}'")
            last_document = current_document

        if (chunk.metadata["id"] not in existing_ids):
            new_chunks.append(chunk)
            if (current_document not in added_documents):
                added_documents.append(current_document)
        else:
            skipped_chunks.append(chunk)
            if (current_document not in skipped_documents):
                skipped_documents.append(current_document)

    # Add chunks and IDs to database
    if len(new_chunks):
        print("\nAdding chunks to DB...")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]

        # Needs to be split into batches because chroma has a limit for how many chunks can be added at once.
        for i in range(0, len(new_chunks), config.MAX_BATCH_SIZE):
            new_chunks_batch = new_chunks[i: i+config.MAX_BATCH_SIZE]
            new_chunk_ids_batch = new_chunk_ids[i: i+config.MAX_BATCH_SIZE]
            print(f"{i} of {len(new_chunks)} complete...", end="\r")
            db.add_documents(new_chunks_batch, ids=new_chunk_ids_batch)

    # Print the summary
    if (new_chunks):
        print(f"{len(new_chunks)} chunks from the following documents were added:\n{
              "\n".join(added_documents)}")
    if (skipped_chunks):
        print(f"{len(skipped_chunks)} chunks from the following documents are already in the DB and were not added:\n{
              "\n".join(skipped_documents)}")
    print("==========================")


def delete_db_files(db: Chroma, file_list: List) -> List:
    """
    Deletes all chunks associated with the given files from the DB.
    """
    db_size = utils.get_folder_size(db._persist_directory)
    print(f"Size of DB before deleting files: {db_size}")
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
            db_size = utils.get_folder_size(db._persist_directory)
            print(f"Size of DB after deleting files: {db_size}")
        else:
            print("No documents found from the specified source.")
    return file_list


def clear_uploads():
    """
    Clears out documents from the data folder, not from the DB.
    """
    file_list = []
    print(f"Clearing the uploads from {document_path}")
    for filename in os.listdir(document_path):
        file_path = os.path.join(document_path, filename)
        try:
            # Check if it's a file and remove it
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.remove(file_path)
                file_list.append(str(filename))
            # Check if it's a directory and remove it along with its contents
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')
    return file_list


def push_to_database(db: Chroma):
    """
    Loads docs, adds them to DB
    """
    documents = load_documents()
    chunks = split_text(documents)
    save_to_chroma(db, chunks)
    clear_uploads()
    return documents


def main():
    return


if __name__ == "__main__":
    main()
