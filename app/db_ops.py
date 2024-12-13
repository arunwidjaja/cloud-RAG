from imports import *

# Local Modules
import doc_ops
import doc_ops_utils
import db_ops_utils
import utils
import config
from get_embedding_function import get_embedding_function
from db_ops_utils import generate_placeholder_document


def add_persistent_collection(db: Chroma, collection_name: str, embedding_function='openai') -> str:
    """
    Creates a new collection in the DB. Inserts a placeholder file to force Chroma to persist it.

    Args:
        db: the database
        collection_name: the name of the collection to create
        embedding_function: the name of the embedding function for the collection

    Returns:
        The name of the collection
    """
    # Create collection
    chroma_client = db._client
    ef = get_embedding_function(embedding_function)
    chroma_client.create_collection(
        name=collection_name
    )

    # Initialize Chroma object
    collection = Chroma(
        collection_name=collection_name,
        persist_directory=db._persist_directory,
        embedding_function=ef
    )

    try:
        # Add placeholder document to persist collection
        placeholder_document = generate_placeholder_document()
        id = collection.add_documents(placeholder_document)
        print(f"Added placeholder document: {id}")
        return collection_name
    except Exception as e:
        print(f"There was an error creating the collection: {str(e)}")
        raise


def delete_collection(db: Chroma, collection_name: str) -> str:
    """
    Deletes the collection from the db. Deletes all contents as well.

    Args:
        db: the database
        collection_name: the collection to delete

    Reteurns:
        The name of the deleted collection
    """
    try:
        db._client.delete_collection(collection_name)
        return collection_name
    except Exception as e:
        print(f"There was an error deleting the collection: {e}")


def save_to_chroma(db: Chroma, chunks: List[Document], collection_name: str) -> List[str] | str:
    """
    Saves document chunks to the Chroma DB in the specified collection

    Args:
        db: the database
        chunks: the document chunks
        collection_name: the name of the collection to save to

    Returns:
        List of chunks that were saved. Chunks that are skipped are not returned.
    """
    print("Saving chunks to Chroma DB...")
    # Finding number of chunks in each document
    chunk_counts = Counter([chunk.metadata.get("source") for chunk in chunks])

    collection = Chroma(
        client=db._client,
        embedding_function=db._embedding_function,
        collection_name=collection_name
    )

    # Get IDs of existing document chunks
    existing_items = collection.get()
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing chunks in DB: {len(existing_ids)}")

    # Add documents that aren't already in the database (don't have a matching ID)
    new_chunks = []
    skipped_chunks = []
    skipped_documents = []
    added_documents = []
    last_document = ""

    for chunk in chunks:
        current_document = f"{chunk.metadata["source"]}"
        # triggers when we move on to a new file (checks if file name is different)
        if (last_document != current_document):
            print(f"Currently processing {
                  chunk_counts[current_document]:04d} chunks from: '{utils.extract_file_name(current_document)}'")

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
            collection.add_documents(new_chunks_batch, ids=new_chunk_ids_batch)

    # Print the summary
    if (new_chunks):
        print(f"{len(new_chunks)} chunks from the following documents were added:\n{
              "\n".join(utils.extract_file_name(added_documents))}")
    if (skipped_chunks):
        print(f"{len(skipped_chunks)} chunks from the following documents are already in the DB and were not added:\n{
              "\n".join(utils.extract_file_name(skipped_documents))}")
    print("==========================")
    return utils.extract_file_name(added_documents)


def delete_db_files(db: Chroma, file_hash_list: List, collection_name: str) -> List[str]:
    """
    Deletes all chunks associated with the given files from the collection.
    Does not delete the source files from the archive.

    Args:
        db: the database
        file_list: list of file hashes
        collection: the collection containing the file chunks

    Returns:
        The list of file names that were deleted
    """

    collection_db = db_ops_utils.get_collection(db, collection_name)
    # Gets the actual chromadb collection
    # LangChain doesn't support deletion, deletion needs to be done through chromadb directly.
    # .delete() must be called on a collection, can't be called on the entire DB.
    chroma_collection = collection_db._collection

    deleted_files = []
    for file_hash in file_hash_list:
        file_metadata = chroma_collection.get(
            where={"source_hash": file_hash},
            include=["metadatas", "documents"]
        )
        ids_to_delete = file_metadata['ids']

        # Delete job needs to be split into batches
        # Chroma allows a maximum number of embeddings to be modified at once
        if ids_to_delete:
            for i in range(0, len(ids_to_delete), config.MAX_BATCH_SIZE):
                deletion_batch = ids_to_delete[i: i+config.MAX_BATCH_SIZE]
                chroma_collection.delete(deletion_batch)
            deleted_file = file_metadata['metadatas'][0]['source_base_name']
            deleted_files.append(deleted_file)
        else:
            print("No documents found from the specified source.")
    return deleted_files


async def push_to_database(db: Chroma, collection: str) -> List[str]:
    """
    Pushes uploads to the database then archives them.

    Args:
        db: The database
        file_hash_list: The list of hashes of files to push
        collection: The collection to push the documents to

    Returns:
        a list of the pushed uploads
    """
    chunks = await doc_ops.process_documents(collection)
    documents_list = save_to_chroma(db, chunks, collection)
    doc_ops_utils.archive_all_uploads()
    return documents_list


def main():
    return


if __name__ == "__main__":
    main()
