# External Modules
from chromadb.api.models.Collection import Collection  # type: ignore
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from typing import Any, List, Tuple


# Local Modules
from api_dependencies import DatabaseManager
from custom_types import FileMetadata


def get_documents_and_metadatas_by_hash(dbm: DatabaseManager, hash: str) -> Tuple[List[str], List[dict[Any, Any]]]:
    db_connection = dbm.get_connection()
    query = text("""
        SELECT document, cmetadata
        FROM langchain_pg_embedding
        WHERE cmetadata->>'source_hash' = :source_hash
    """)
    with db_connection.connect() as connection:
        results = connection.execute(
            query,
            {'source_hash': hash}
        )
        documents: List[str] = []
        metadatas: List[dict[Any, Any]] = []
        for row in results:
            documents.append(row[0])
            metadatas.append(row[1])

        if len(documents) != len(metadatas):
            raise ValueError(f"Document and metadata lengths don't match: {
                             len(documents)} vs {len(metadatas)}")

        return documents, metadatas


def get_ids_by_hash(dbm: DatabaseManager, hash: str) -> List[str]:
    """
    Gets IDs of all embeddings associated with a particular file hash.
    """
    db_connection = dbm.get_connection()
    query = text("""
        SELECT id 
        FROM langchain_pg_embedding 
        WHERE cmetadata->>'source_hash' = :source_hash
    """)
    with db_connection.connect() as connection:
        results = connection.execute(
            query,
            {'source_hash': hash}
        )
        return [row[0] for row in results]


def get_ids_in_collection(dbm: DatabaseManager, collection: str) -> List[str]:
    """
    Returns a list of all of the unique IDs in the Postgres database for a particular collection.
    """
    db_connection = dbm.get_connection()
    try:
        with db_connection.connect() as connection:
            query = text(f"""
                SELECT DISTINCT e.id
                FROM langchain_pg_embedding e
                JOIN langchain_pg_collection c ON e.collection_id = c.uuid
                WHERE c.name = :collection
            """)
            result = connection.execute(
                query,
                {"collection": collection}
            )
            ids = [str(row[0]) for row in result]
            return ids
    except SQLAlchemyError as e:
        print(f"PostgreSQL Error: {e}")
        raise


def get_files_metadata(dbm: DatabaseManager, collection_names: List[str]) -> List[FileMetadata]:
    """
    Gets the metadata of all files (not chunks) in the given collection.
    Metadata from chunks in the same file are aggregated.

    Args:
        dbm: The DatabaseManager
        collection_names: The list of collections to get the metadata for.

    Returns:
        List[FileMetadata]: A list of dictionaries containing metadata about the files.
    """
    db_connection = dbm.get_connection()

    query = text("""
        SELECT 
            cmetadata->>'source_hash' as hash,
            cmetadata->>'source_base_name' as name,
            cmetadata->>'collection' as collection,
            SUM((cmetadata->>'word_count')::integer) as total_word_count,
            SUM((cmetadata->>'tokens')::integer) as total_token_count
        FROM langchain_pg_embedding
        WHERE cmetadata->>'collection' = ANY(:collections)
        GROUP BY 
            cmetadata->>'source_hash',
            cmetadata->>'source_base_name',
            cmetadata->>'collection'
    """)

    with db_connection.connect() as connection:
        results = connection.execute(
            query,
            {"collections": collection_names}
        ).fetchall()

    file_metadata_list: List[FileMetadata] = [
        FileMetadata(
            hash=result.hash,
            name=result.name,
            collection=result.collection,
            word_count=result.total_word_count,
            token_count=result.total_token_count
        )
        for result in results
    ]

    return file_metadata_list
