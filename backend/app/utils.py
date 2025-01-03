# Enforce strict typing
from __future__ import annotations

# External Modules
from typing import Any, Awaitable, Callable, Dict, List, TypeVar

import functools
import hashlib
import os
import re
import shutil
import time

# Local Modules


def format_time(ms: float) -> str:
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
    time_components: List[str] = []
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


T = TypeVar('T')


def timer(function: Callable[..., T]) -> Callable[..., T]:
    """
    Wrapper for timing functions
    """
    def wrapper(*args: Any, **kwargs: Any) -> T:
        start_time = time.perf_counter()
        result = function(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time_ms = (end_time - start_time) * 1000
        print(f"{function.__name__} completed in: {
              format_time(elapsed_time_ms)}")
        return result
    return wrapper


def async_timer(function: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
    """
    Wrapper for timing async functions accurately
    """
    @functools.wraps(function)
    async def wrapper(*args: Any, **kwargs: Any) -> T:
        start_time = time.perf_counter()
        result = await function(*args, **kwargs)
        end_time = time.perf_counter()
        elapsed_time_ms = (end_time - start_time) * 1000
        print(f"{function.__name__} completed in: {
              format_time(elapsed_time_ms)}")
        return result
    return wrapper


def extract_file_name(path: str) -> str:
    """
    Extract the file name from the path.
    This works for both regular paths and chunk tags (which are paths that are appended with chunk data).
    """
    path_trim: str = os.path.basename(path)  # gets file name
    path_trim = re.sub(r':\d+:\d+$', '', path_trim)  # trims off tags
    return path_trim


def extract_file_names(paths: List[str]) -> List[str]:
    file_names: List[str] = []
    for path in paths:
        file_names.append(extract_file_name(path))
    return file_names


def get_folder_size(path: str, print_all: bool = False) -> int:
    """
    Gets size of given folder.
    If print_all is True, prints sizes of all files
    """
    total_size = 0
    for dirpath, _, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                size_current = os.path.getsize(fp)
                total_size += size_current
                if print_all:
                    print(f"Size of {fp}: {size_current}")
    return total_size


def mirror_directory(src_path: str, dest_path: str) -> None:
    """
    Deletes dest_path. Copies src_path to dest_path.
    """
    if os.path.exists(dest_path):
        print(f"Deleting existing destination folder: {dest_path}")
        shutil.rmtree(dest_path)

    print(f"Copying {src_path} to {dest_path}")
    os.makedirs(dest_path)
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def copy_directory(src_path: str, dest_path: str) -> None:
    """
    Copies src_path to dest_path.
    """
    if not os.path.exists(dest_path):
        print(f"{dest_path} doesn't exist. Creating it now...")
        os.makedirs(dest_path)
    print(f"Copying {src_path} to {dest_path}")
    shutil.copytree(src_path, dest_path, dirs_exist_ok=True)


def get_hash(filepath: str, hash_algorithm: str = "md5", chunk_size: int = 8192) -> str:
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
def get_hash_dir(directory: str, hash_algorithm: str = "md5", chunk_size: int = 8192) -> dict[str, str]:
    """
    Returns a dictionary containing the hashes and corresponding paths of all files in a directory.
    Hashes as keys, paths as values.
    """
    dir_hash: Dict[str, str] = {}
    for item in os.listdir(directory):
        file_path = os.path.join(directory, item)
        if (os.path.isfile(file_path)):
            file_hash = get_hash(file_path, hash_algorithm, chunk_size)
            dir_hash[file_hash] = file_path
    return dir_hash


def get_word_count(file_path: str) -> int:
    """
    Gets word count of the file at file_path
    """
    return 0
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()  # Read the entire file as a string
        words = text.split()  # Split text by whitespace to get words
    return len(words)  # Count the number of words


def strip_text(uuid: str) -> str:
    return ''.join(char for char in uuid if char.isalnum())


def strip_email(email: str) -> str:
    return strip_text(email.split('@')[0])


def main() -> None:
    print("running utils.py")


if __name__ == "__main__":
    main()
