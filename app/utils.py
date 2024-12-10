from imports import *

# Modules
import config
import hashlib
import time

_base_paths = {}
_user_paths = {}


def setup_paths():
    """
    Initializes resource paths. Creates them if they don't exist.
    """
    print("Initializing resource paths...")
    global _base_paths
    global _user_paths

    keys = ['DB', 'UPLOADS', 'ARCHIVE', 'CHATS', 'AUTH']
    _base_paths = dict.fromkeys(keys, None)

    _document_paths = {
        "LOCAL": config.PATH_UPLOADS_LOCAL,
        "EFS": config.PATH_UPLOADS_EFS
    }
    _chroma_paths = {
        "LOCAL": config.PATH_CHROMA_LOCAL,
        "EFS": config.PATH_CHROMA_EFS
    }
    _archive_paths = {
        "LOCAL": config.PATH_ARCHIVE_LOCAL,
        "EFS": config.PATH_ARCHIVE_EFS
    }
    _chat_paths = {
        "LOCAL": config.PATH_CHATS_LOCAL,
        "EFS": config.PATH_CHATS_EFS
    }
    _auth_paths = {
        "LOCAL": config.PATH_AUTH_LOCAL,
        "EFS": config.PATH_AUTH_EFS
    }

    if 'var' in str(config.CURRENT_PATH):
        _base_paths['DB'] = _chroma_paths['EFS']
        _base_paths['UPLOADS'] = _document_paths['EFS']
        _base_paths['ARCHIVE'] = _archive_paths['EFS']
        _base_paths['CHATS'] = _chat_paths['EFS']
        _base_paths['AUTH'] = _auth_paths['EFS']
    else:
        _base_paths['DB'] = _chroma_paths['LOCAL']
        _base_paths['UPLOADS'] = _document_paths['LOCAL']
        _base_paths['ARCHIVE'] = _archive_paths['LOCAL']
        _base_paths['CHATS'] = _chat_paths['LOCAL']
        _base_paths['AUTH'] = _auth_paths['LOCAL']

    for key, path, in _base_paths.items():
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"Creating directory: {path}")
        else:
            print(f"Located directory: {path}")
    auth_db = _base_paths['AUTH'] / "users.db"
    auth_db.touch()

    _user_paths = _base_paths


setup_paths()


def set_env_paths(user_id: str):
    """
    Appends path with the user's id and creates it.
    Auth database is sshared across users.
    """
    global _user_paths

    _user_paths = _base_paths.copy()
    for key, path in _user_paths.items():
        if not os.path.isfile(_user_paths[key]):
            _user_paths[key] = _base_paths[key] / strip_text(user_id)
            os.makedirs(_user_paths[key], exist_ok=True)
            print(f"Verified user's path exists: {_user_paths[key]}")
    _user_paths['AUTH'] = _base_paths['AUTH']


def get_env_paths() -> dict[str, Path]:
    return _user_paths.copy()


def format_time(ms: float):
    """
    Accepts millisconds and returns the amount in hours, mins, secs, and ms
    """
    # Calculate hours, minutes, seconds, and remaining milliseconds
    hours = ms // (1000 * 60 * 60)
    remaining_ms = ms % (1000 * 60 * 60)

    minutes = remaining_ms // (1000 * 60)
    remaining_ms %= (1000 * 60)

    seconds = remaining_ms // 1000
    remaining_ms %= 1000

    # pad to 2 digits
    time_components = []
    if hours > 0:
        time_components.append(f"{hours:02} hours")
    if minutes > 0:
        time_components.append(f"{minutes:02} minutes")
    if seconds > 0:
        time_components.append(f"{seconds:02} seconds")
    if remaining_ms > 0:
        time_components.append(f"{remaining_ms:.3f} milliseconds")

    # Join the components with commas and return the result
    return ", ".join(time_components)


def timer(function):
    """
    Wrapper for timing functions
    """
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = function(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time_ms = (end_time - start_time) * 1000
        print(f"{function.__name__} completed in: {
              format_time(elapsed_time_ms)}")
        return result
    return wrapper


def extract_file_name(paths: List[str] | str) -> List[str] | str:
    """
    Extract the file name from the path or list of paths.
    This works for both regular paths and chunk tags (which are paths that are appended with chunk data).
    """
    file_name_list = []
    path_list = paths
    # convert strings to a list first
    if isinstance(paths, str):
        path_list = [paths]

    for path in path_list:
        path_trim = os.path.basename(path)  # gets file name
        path_trim = re.sub(r':\d+:\d+$', '', path_trim)  # trims off tags
        file_name_list.append(path_trim)

    if isinstance(paths, str):
        return file_name_list[0]
    return file_name_list


def get_folder_size(path: str, print_all=False):
    """
    Gets size of given folder.
    If print_all is True, prints sizes of all files
    """
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                size_current = os.path.getsize(fp)
                total_size += size_current
                if print_all:
                    print(f"Size of {fp}: {size_current}")
    return total_size


def mirror_directory(src_path: str, dest_path: str):
    """
    Deletes dest_path. Copies src_path to dest_path.
    """
    if os.path.exists(dest_path):
        print(f"Deleting existing destination folder: {dest_path}")
        shutil.rmtree(dest_path)

    print(f"Copying {src_path} to {dest_path}")
    os.makedirs(dest_path)
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def copy_directory(src_path: str, dest_path: str):
    """
    Copies src_path to dest_path.
    """
    if not os.path.exists(dest_path):
        print(f"{dest_path} doesn't exist. Creating it now...")
        os.makedirs(dest_path)
    print(f"Copying {src_path} to {dest_path}")
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def get_hash(filepath, hash_algorithm="md5", chunk_size=8192):
    """
    Gets the file hash.
    Defaults to md5 and 8 KB chunk
    """
    hash_func = hashlib.new(hash_algorithm)
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            hash_func.update(chunk)
    return hash_func.hexdigest()


@timer
def get_hash_dir(directory, hash_algorithm="md5", chunk_size=8192) -> dict[str, str]:
    """
    Returns a dictionary containing the hashes and corresponding paths of all files in a directory.
    Hashes as keys, paths as values.
    """
    dir_hash = {}
    for item in os.listdir(directory):
        file_path = os.path.join(directory, item)
        if (os.path.isfile(file_path)):
            file_hash = get_hash(file_path, hash_algorithm, chunk_size)
            dir_hash[file_hash] = file_path
    return dir_hash


def get_word_count(file_path) -> int:
    """
    Gets word count of the file at file_path
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()  # Read the entire file as a string
        words = text.split()  # Split text by whitespace to get words
    return len(words)  # Count the number of words


def strip_text(uuid: str) -> str:
    return ''.join(char for char in uuid if char.isalnum())


def strip_email(email: str) -> str:
    return strip_text(email.split('@')[0])


def main():
    print("running utils.py")


if __name__ == "__main__":
    main()
