from imports import *

# Local Modules
import doc_ops
import doc_ops_utils
import utils
import config


def save_to_chroma(db: Chroma, chunks: List[Document]) -> List:
    """
    Returns a list of the documents that were saved to the DB
    """
    print("Saving chunks to Chroma DB...")
    chunks_with_ids = doc_ops.add_chunk_ids(chunks)
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
    return utils.extract_file_name(added_documents)


def delete_db_files(db: Chroma, file_list: List) -> List:
    """
    Deletes all chunks associated with the given files from the DB.
    """
    db_size = utils.get_folder_size(db._persist_directory)
    print(f"Size of DB before deleting files: {db_size}")
    collection = db._collection
    deleted_files = []

    for file_path in file_list:
        file_metadata = collection.get(
            where={"source": file_path},
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
        deleted_file = utils.extract_file_name(file_path)
        deleted_files.append(deleted_file)
    return deleted_files


def push_to_database(db: Chroma):
    """
    pushes documents to the database
    """
    documents = doc_ops.load_documents()
    chunks = doc_ops.chunk_text(documents)
    documents_list = save_to_chroma(db, chunks)
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
