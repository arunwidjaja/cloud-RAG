from imports import *

# Local Modules
import utils


def download_files(requested_files: List | str) -> List[str] | str:
    """
    Downloads the files in the given list to the user's home path.
    Returns the name of the file(s) that were downloaded as a string or list
    """
    source_location = utils.get_env_paths()['ARCHIVE']
    download_location = str(Path.home())
    downloaded_files = []

    if isinstance(requested_files, str):
        requested_files = [requested_files]

    # Calculate hashes of all files in the archive
    # TODO: Need to make this more efficient so that the hashes don't need to be recalculated for every file every time

    archive_hash = utils.get_hash_dir(source_location)

    for requested_hash in requested_files:
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

    if isinstance(requested_files, str):
        return downloaded_files[0]
    return downloaded_files


def get_db_files_metadata(db: Chroma) -> List[dict]:
    """
    Gets the metadata of all the unique files in the DB.

    Args:
        db: The Chroma DB instance

    Returns:
        A list of dictionaries that list the file name, hash, and word count
    """
    all_metadata = db.get(include=["metadatas"])
    chunk_metadata = all_metadata['metadatas']

    word_count_dict = defaultdict(int)

    # Sum the word counts of each chunk belonging to a unique file/hash
    for chunk in chunk_metadata:
        key = (chunk["source_base_name"], chunk["source_hash"])
        word_count_dict[key] += chunk["word_count"]

    file_metadata = [
        {
            "name": source_base_name,
            "hash": source_hash,
            "word_count": word_count
        }
        for (source_base_name, source_hash), word_count in word_count_dict.items()
    ]
    return file_metadata


def get_db_chunks(db: Chroma, source_list: str | List[str]) -> List[Document]:
    """
    Returns all chunks from the given source files
    """
    collection = db._collection
    results = collection.get(where={'source': {'$in': source_list}})
    return results


def generate_placeholder_document() -> List[Document]:
    placeholder_document = Document(
        page_content='placeholder_document',
        metadata={
            'id': 'placeholder_document',
            'author': 'placeholder_document',
            'note': 'placeholder_document'
        }
    )
    return [placeholder_document]


def get_all_collections_names(db: Chroma):
    return [collection.name for collection in db._client.list_collections()]
