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
    file_list = requested_files

    if isinstance(requested_files, str):
        file_list = [requested_files]
    for file in file_list:
        file_name = os.path.basename(file)

        source_path = os.path.join(source_location, file_name)
        destination_path = os.path.join(download_location, file_name)
        try:
            shutil.copy(source_path, destination_path)
            downloaded_files.append(file_name)
            print(f"Downloaded {file_name} to {destination_path}")
        except Exception as e:
            print(f"Error occurred while attempting to download file: {e}")

    if isinstance(requested_files, str):
        return downloaded_files[0]
    return downloaded_files


def get_db_file_names(db: Chroma, file_name_only=False) -> List:
    """
    Gets a list of all unique source files in the given DB.
    """
    collection = db._collection
    results = collection.get(include=["metadatas"])

    # Extract unique source file names
    path_set = set()
    for metadata in results['metadatas']:
        if 'source' in metadata:
            path_set.add(metadata['source'])
    path_list = sorted(list(path_set))

    # Extracts file names (without path) if file_name_only is True
    if (file_name_only):
        return utils.extract_file_name(path_list)
    return path_list
