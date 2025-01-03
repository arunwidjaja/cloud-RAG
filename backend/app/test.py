from api_dependencies import DatabaseManager

import asyncio
import pprint

# Local Modules
import db_collections
import doc_ops
import db_ops
import db_ops_utils


# Testing configuration
# Set these before running the test
test_coll = "20250102collection"
test_user = "20250102user"
docs_path = "C:/Users/Arun Widjaja/Desktop/sampledocs"
test_dbmg = DatabaseManager()

# Need to format collection name before running test
# This happens automatically in prod
test_coll_formatted = db_collections.format_name(
    collections=[test_coll],
    uuid=test_user
)
# initialize connection to database
# Remember, this creates a default collection with the same name as the user
test_dbmg.initialize_db(test_user)


async def test_push():
    """
    Pushes test documents to the database.
    """
    # Create the test collection
    db_ops.create_collection(test_dbmg, test_coll_formatted[0])

    # run doc pipeline on test documents
    docs = await doc_ops.load_documents(docs_path)
    chunks = doc_ops.chunk_text(docs)
    doc_ops.add_user_ids(chunks, test_user)
    doc_ops.add_token_count(chunks)
    doc_ops.add_chunk_ids(chunks)
    doc_ops.add_source_hash(chunks)
    doc_ops.add_source_base_name(chunks)
    doc_ops.add_word_count(chunks)
    doc_ops.add_sentiment(chunks)
    doc_ops.add_collection(
        chunks=chunks,
        collection=test_coll_formatted[0]
    )

    # save to database
    db_ops.add_chunks_to_collection(test_dbmg, chunks, test_coll_formatted[0])


def test_get_file_metadata():
    file_metadata = db_ops_utils.get_files_metadata(
        dbm=test_dbmg,
        collection_names=test_coll_formatted
    )
    print("Metadata of files in the DB:")
    pprint.pprint(file_metadata)


async def main() -> None:
    # await test_push()
    test_get_file_metadata()


if __name__ == "__main__":
    asyncio.run(main())
