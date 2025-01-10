# External Modules
from collections import Counter
from langchain_postgres import PGVector
from langchain.schema import Document
from sqlalchemy import text
from typing import List

# Local Modules
from database_manager import DatabaseManager
from get_embedding_function import get_embedding_function

import config
import database_utils

import document_pipeline
import document_utils
import utils


def create_collection(dbm: DatabaseManager, collection_name: str, embedding_function: str = config.DEFAULT_EMBEDDING) -> str:
    """
    Creates a new collection in the DB.

    Args:
        dbm: the database manager
        collection_name: the name of the collection to create
        embedding_function: the name of the embedding function for the collection

    Returns:
        The name of the collection
    """
    connection = dbm.get_connection()
    ef = get_embedding_function(embedding_function)

    try:
        store = PGVector(
            connection=connection,
            embeddings=ef,
            collection_name=collection_name
        )
        if not store:
            raise Exception("There was an error creating the collection.")
        return collection_name
    except Exception as e:
        print(f"There was an error creating the collection: {str(e)}")
        raise


def delete_collection(dbm: DatabaseManager, collection_name: str) -> str:
    """
    Deletes the collection from the db. Deletes all contents as well.

    Args:
        db: the database
        collection_name: the collection to delete

    Reteurns:
        The name of the deleted collection
    """
    db_connection = dbm.get_connection()

    # Delete the collection's contents first.
    store = dbm.get_collection(collection_name)
    ids = database_utils.get_ids_in_collection(dbm, collection_name)
    store.delete(
        ids=ids,
        collection_only=True
    )

    # Delete the collection's metadata entry
    with db_connection.connect() as connection:
        query = text("""
            DELETE from langchain_pg_collection
            WHERE name = :name
        """)
        result = connection.execute(
            query,
            {"name": collection_name}
        )
        connection.commit()
        if result.rowcount > 0:
            return collection_name
        else:
            return ""


def add_chunks_to_collection(dbm: DatabaseManager, chunks: List[Document], collection_name: str) -> List[str]:
    """
    Saves document chunks to the DB in the specified collection

    Args:
        db: the database
        chunks: the document chunks
        collection_name: the name of the collection to save to

    Returns:
        List of chunks that were saved. Chunks that are skipped are not returned.
    """
    print("Saving chunks to Chroma DB...")
    # Finding number of chunks in each document
    chunk_counts: Counter[str] = Counter(
        [getattr(chunk, "metadata")["source"] for chunk in chunks])

    collection = dbm.get_collection(collection_name)

    # Get IDs of existing document chunks
    existing_ids = database_utils.get_ids_in_collection(dbm, collection_name)
    print(f"Number of existing chunks in DB: {len(existing_ids)}")

    # Add documents that aren't already in the database (don't have a matching ID)
    new_chunks: List[Document] = []
    skipped_chunks: List[Document] = []
    skipped_documents: List[str] = []
    added_documents: List[str] = []
    last_document = ""

    for chunk in chunks:
        current_document: str = f"{getattr(chunk, "metadata")["source"]}"
        # triggers when we move on to a new file (checks if file name is different)
        if (last_document != current_document):
            print(f"Currently processing {
                  chunk_counts[current_document]:04d} chunks from: '{utils.extract_file_name(current_document)}'")

            last_document = current_document

        cur_id: str = getattr(chunk, "metadata")["id"]
        if (cur_id not in existing_ids):
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
        new_chunk_ids: List[str] = [getattr(chunk, "metadata")[
            "id"] for chunk in new_chunks]

        # Needs to be split into batches because chroma has a limit for how many chunks can be added at once.
        for i in range(0, len(new_chunks), config.MAX_BATCH_SIZE):
            new_chunks_batch = new_chunks[i: i+config.MAX_BATCH_SIZE]
            new_chunk_ids_batch = new_chunk_ids[i: i+config.MAX_BATCH_SIZE]
            print(f"{i} of {len(new_chunks)} complete...", end="\r")
            collection.add_documents(new_chunks_batch, ids=new_chunk_ids_batch)

    # Print the summary
    if (new_chunks):
        print(f"{len(new_chunks)} chunks from the following documents were added:\n{
              "\n".join(utils.extract_file_names(added_documents))}")
    if (skipped_chunks):
        print(f"{len(skipped_chunks)} chunks from the following documents are already in the DB and were not added:\n{
              "\n".join(utils.extract_file_names(skipped_documents))}")
    print("==========================")
    return utils.extract_file_names(added_documents)


def delete_files(dbm: DatabaseManager, file_hash_list: List[str], collection_name: str) -> List[str]:
    """
    Deletes all chunks associated with the given files from the collection.
    Does not delete the source files from the archive.

    Args:
        dbm: the database managers
        file_list: list of file hashes
        collection: the collection containing the file chunks

    Returns:
        The list of file names that were deleted
    """

    store = dbm.get_collection(collection_name)
    file_metadata = database_utils.get_files_metadata(dbm, [collection_name])

    deleted_files: List[str] = []
    for file_hash in file_hash_list:
        target_hashes = database_utils.get_ids_by_hash(dbm, file_hash)
        if target_hashes:
            store.delete(target_hashes)
            deleted_files.append(file_hash)

    # connvert hashes to file names
    hash_to_name = {metadata["hash"]: metadata["name"]
                    for metadata in file_metadata}
    for i, hash in enumerate(deleted_files):
        if hash in hash_to_name:
            deleted_files[i] = hash_to_name[hash]

    return deleted_files


async def push_db(dbm: DatabaseManager, collection: str, user_id: str) -> List[str]:
    """
    Pushes uploads to the database then archives them.

    Args:
        db: The database
        file_hash_list: The list of hashes of files to push
        collection: The collection to push the documents to

    Returns:
        a list of the pushed uploads
    """
    chunks = await document_pipeline.process_documents(collection, user_id)
    documents_list = add_chunks_to_collection(dbm, chunks, collection)
    document_utils.archive_all_uploads()
    return documents_list


def main():
    return


if __name__ == "__main__":
    main()
