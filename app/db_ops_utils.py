from imports import *

# Local Modules
import utils


def download_files(requested_files_hashes: List | str, collection_name) -> List[str] | str:
    """
    Downloads the files in the given list to the user's home path.

    Args:
        requested_files_hashes: the list of hashes of the requested files

    Returns:
        The name of the file(s) that were downloaded.
    """
    # collection_name is actually not used because all documents are stored in the same archive
    source_location = utils.get_env_user_paths()['ARCHIVE']
    download_location = str(Path.home())
    downloaded_files = []

    if isinstance(requested_files_hashes, str):
        requested_files_hashes = [requested_files_hashes]

    archive_hash = utils.get_hash_dir(source_location)

    for requested_hash in requested_files_hashes:
        source_path = archive_hash.get(requested_hash)
        try:
            if source_path is not None:
                file_name = utils.extract_file_name(source_path)
                destination_path = os.path.join(download_location, file_name)
                shutil.copy(source_path, destination_path)
                downloaded_files.append(file_name)
                print(f"Downloaded {file_name} to {destination_path}")
        except Exception as e:
            print(f"Error occurred while attempting to download file: {e}")

    if isinstance(requested_files_hashes, str):
        return downloaded_files[0]
    return downloaded_files


def get_db_files_metadata(db: Chroma, collection_names: List[str]) -> List[dict]:
    """
    Gets the metadata of all the unique files in the DB.

    Args:
        db: The Chroma DB instance

    Returns:
        A list of dictionaries that list the file name, hash, and word count
    """
    all_chunk_metadata: List[dict] = []
    print(f"Collections currently in db: ")
    print(get_all_collections_names(db))
    # Iterate through each collection and retrieve metadata
    for collection in collection_names:
        print(f"Retrieving collection: {collection}")
        collection_db = get_collection(db, collection)
        metadata = collection_db.get(include=['metadatas'])
        if metadata:
            chunk_metadata = metadata['metadatas']
            all_chunk_metadata.extend(chunk_metadata)

    # Merge all chunks with an identical hash
    # Word count has to be summed
    chunk_metadata_merged = {}
    for chunk_metadata in all_chunk_metadata:
        key = (chunk_metadata["source_hash"])
        if key not in chunk_metadata_merged:
            chunk_metadata_merged[key] = {
                'hash': key,
                'name': chunk_metadata['source_base_name'],
                'collection': chunk_metadata['collection'],
                'word_count': chunk_metadata['word_count']
            }
        else:
            chunk_metadata_merged[key]['word_count'] += chunk_metadata['word_count']

    file_metadata = list(chunk_metadata_merged.values())
    return file_metadata


def get_db_chunks(db: Chroma, source_list: str | List[str]) -> List[Document]:
    """
    Returns all chunks from the given source files
    """
    collection = db._collection
    results = collection.get(where={'source': {'$in': source_list}})
    return results


def generate_placeholder_document() -> List[Document]:
    """
    Generates a placeholder document.
    Can be added to a Chroma DB collection to persist the collection.

    Returns:
        A placeholder document
    """
    placeholder_document = Document(
        page_content='placeholder_document',
        metadata={
            'id': 'placeholder_document',
            'author': 'placeholder_document',
            'note': 'placeholder_document'
        }
    )
    return [placeholder_document]


def get_collection(db: Chroma, collection: str) -> Chroma:
    """
    Returns a Chroma instance pointing to the specific collection in the database.

    Args:
        db: the databasse or a collection in the same database as the target collection

    Returns:
        A Chroma object pointing to collection
    """
    chroma_client = db._client
    collection_db = Chroma(
        client=chroma_client,
        collection_name=collection
    )
    return collection_db


def get_all_collections_names(db: Chroma) -> List[str]:
    """
    Returns a list of all the collections in the db.
    Args:
        db: the database

    Returns:
        A list of the names of all collections in the db
    """
    return [collection.name for collection in db._client.list_collections()]
