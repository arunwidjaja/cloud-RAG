from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain.document_loaders.pdf import PyPDFDirectoryLoader
from langchain_community.vectorstores import Chroma

from dotenv import load_dotenv
import os
import sys
import shutil
import argparse
from typing import List
from collections import Counter

# Local Functions
from get_embedding_function import get_embedding_function

# Load environment variables. Assumes that project contains .env file with API keys
load_dotenv()

# ---- Set OpenAI API key
# Change environment variable name from "OPENAI_API_KEY" to the name given in
# your .env file.


CHROMA_PATH = "chroma"
DATA_PATH_MD = "data/md"
DATA_PATH_PDF = "data/pdf"
MAX_BATCH_SIZE = 1000

# formatting variables
OUTPUT_SEPARATOR = "===================================="


def add_to_database():
    documents = load_documents("all")
    chunks = split_text(documents)
    save_to_chroma(chunks)


def reset_database():
    print("Resetting the DB")
    clear_database()
    add_to_database()


def clear_database():
    print("Clearing out the DB.")
    if os.path.exists(CHROMA_PATH):
        # print(CHROMA_PATH)
        shutil.rmtree(CHROMA_PATH)
    print("The DB has been cleared.")


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
    loader = DirectoryLoader(DATA_PATH_MD, glob="*.md")
    return loader.load()


def load_pdf():
    loader = PyPDFDirectoryLoader(DATA_PATH_PDF)
    return loader.load()


def split_text(documents: List[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=100,
        length_function=len,
        add_start_index=True,
        is_separator_regex=False
    )
    print(f"{OUTPUT_SEPARATOR}")
    print("Splitting documents into chunks...")
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

    return chunks


def save_to_chroma(chunks: List[Document]):
    # Load the existing database
    # Only working with openai embedding right now
    db = Chroma(
        persist_directory=CHROMA_PATH, embedding_function=get_embedding_function(
            "openai")
    )
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
        for i in range(0, len(new_chunks), MAX_BATCH_SIZE):
            new_chunks_batch = new_chunks[i: i+MAX_BATCH_SIZE]
            new_chunk_ids_batch = new_chunk_ids[i: i+MAX_BATCH_SIZE]
            print(f"{i} of {len(new_chunks)} complete...", end="\r")
            db.add_documents(new_chunks_batch, ids=new_chunk_ids_batch)

    # Print summary
    if (new_chunks):
        print(f"{len(new_chunks)} chunks from the following documents were added:\n{
              "\n".join(added_documents)}")
    if (skipped_chunks):
        print(f"{len(skipped_chunks)} chunks from the following documents are already in the DB and were not added:\n{
              "\n".join(skipped_documents)}")
    print(f"{OUTPUT_SEPARATOR}")


def add_chunk_ids(chunks):
    """
    Adds IDs to the chunks you're trying to add. Returns a list of Chunks.
    The chunk IDs are formatted as "{source}:{page number}:{chunk index}".
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


def main():
    # Check if the database should be cleared (using the --clear flag).
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true",
                        help="Reset the database before populating.")
    parser.add_argument("--clear", action="store_true",
                        help="Clear out the database.")
    args = parser.parse_args()

    if args.clear:
        clear_database()
        sys.exit()
    if args.reset:
        reset_database()
        sys.exit()
    add_to_database()


if __name__ == "__main__":
    main()
