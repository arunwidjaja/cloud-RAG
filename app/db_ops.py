from imports import *

# Local Modules
import doc_ops
import doc_ops_utils
import utils
import config
from get_embedding_function import get_embedding_function
from db_ops_utils import generate_placeholder_document


def add_persistent_collection(db: Chroma, collection_name: str, embedding_function='openai'):
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


def save_to_chroma(db: Chroma, chunks: List[Document], collection_name: str) -> List[str] | str:
    """
    Returns a list of the documents that were saved to the DB
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


def delete_db_files(db: Chroma, file_list: List, collection_name: str) -> List[str]:
    """
    Deletes all chunks associated with the given files from the DB.
    """
    collection = collection_name
    deleted_files = []

    for file_hash in file_list:
        file_metadata = collection.get(
            where={"source_hash": file_hash},
            include=["metadatas", "documents"]
        )
        ids_to_delete = file_metadata['ids']

        # Delete job needs to be split into batches
        # Chroma allows a maximum number of embeddings to be modified at once
        if ids_to_delete:
            for i in range(0, len(ids_to_delete), config.MAX_BATCH_SIZE):
                deletion_batch = ids_to_delete[i: i+config.MAX_BATCH_SIZE]
                collection.delete(deletion_batch)
            deleted_file = file_metadata['metadatas'][0]['source_base_name']
            deleted_files.append(deleted_file)
        else:
            print("No documents found from the specified source.")
    return deleted_files


def push_to_database(db: Chroma, collection: str) -> List[str]:
    """
    Pushes uploads to the database then archives them.
    Returns a list of the pushed uploads.
    """
    chunks = doc_ops.process_documents()
    documents_list = save_to_chroma(db, chunks, collection)
    doc_ops_utils.archive_all_uploads()
    return documents_list


def main():
    # import app.init_db as init_db
    # import prompt_templates

    # def test_function():

    #     prompt = PromptTemplate(
    #         template=prompt_templates.PROMPT_TEMPLATE_THEMATIC,
    #         input_variables=["context"])

    #     stuff_chain = create_stuff_documents_chain(
    #         llm=model,
    #         prompt=prompt)

    #     query = "What did the interviewees like most about sports?"

    #     # TODO: Reference query_data -> similiarity_search_with_relevance_scores
    #     # Need a different type of search to reduce the size of the data into only context that supports the thematic analysis
    #     # How to do this?
    #     # What is the maximum token size? Maybe need to use map_reduce.
    #     input_data = {
    #         "context": "todo",
    #         "question": query
    #     }
    #     response = stuff_chain.invoke(input_data)

    #     print(response)

    # test_function()
    return


if __name__ == "__main__":
    main()
