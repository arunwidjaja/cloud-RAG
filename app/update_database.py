# External packages
import argparse
from collections import Counter
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader
from langchain.document_loaders.pdf import PyPDFDirectoryLoader
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.vectorstores import Chroma
import os
import shutil
import sys
from typing import List

# Modules
import initialize_chroma_db
import config

db = initialize_chroma_db.database


def add_to_database():
    documents = load_documents("all")
    chunks = split_text(documents)
    save_to_chroma(chunks)

# TODO: Cannot erase database while it is initialized. Find a solution.


def reset_database():
    print("Resetting the DB")
    erase_database()
    add_to_database()

# TODO: Cannot erase database while it is initialized. Find a solution.


def erase_database():
    if os.path.exists(initialize_chroma_db.database_path):
        shutil.rmtree(initialize_chroma_db.database_path)
        print("The DB has been cleared.")
    else:
        print("No DB exists yet. Nothing to clear.")


def load_documents(type="all"):
    """
    Provide the file extension that you want to load as a string.
    Defaults to "all" for all file types in the data folder.
    """
    match type:
        case "md":
            documents = load_md()
        case "pdf":
            documents = load_pdf()
        case "all":
            documents = (
                load_md()
                + load_pdf()
            )
    return documents


def load_md():
    print("Loading .md documents...")
    loader = DirectoryLoader(config.PATH_MD, glob="*.md")
    return loader.load()


def load_pdf():
    print("Loading .pdf documents...")
    loader = PyPDFDirectoryLoader(config.PATH_PDF)
    return loader.load()


def split_text(documents: List[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
        is_separator_regex=False
    )
    print("===================================")
    print("Splitting documents into chunks...")
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

    return chunks


def save_to_chroma(chunks: List[Document]):
    db = initialize_chroma_db.database

    # Add IDs to the chunks that you're loading
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

        # create the chunk id
        # the chunk id is formatted as "{source}:{page number}:{chunk index}"
        chunk_id = f"{source}:{page}:{current_chunk_index}"
        chunk.metadata["id"] = chunk_id
        last_page_id = current_page_id
    return chunks


def copy_to_tmp():
    try:
        os.makedirs(config.PATH_CHROMA_TMP, exist_ok=True)
        shutil.copytree(config.PATH_CHROMA,
                        config.PATH_CHROMA_TMP, dirs_exist_ok=True)
    except Exception as e:
        print(f"Error copying Chroma to /tmp: {str(e)}")
        raise
    return True


def main():
    # # Check if the database should be cleared (using the --clear flag).
    # parser = argparse.ArgumentParser()
    # parser.add_argument("--reset", action="store_true",
    #                     help="Reset the database before populating.")
    # parser.add_argument("--clear", action="store_true",
    #                     help="Clear out the database.")
    # args = parser.parse_args()

    # if args.clear:
    #     clear_database()
    #     sys.exit()
    # if args.reset:
    #     reset_database()
    #     sys.exit()
    # add_to_database()
    return


if __name__ == "__main__":
    main()
