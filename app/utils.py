from imports import *

# Modules
import config


def get_env_paths() -> dict[str, Path]:
    """
    Sets environment-sensitive paths/values and returns them in a dictionary.

    """
    keys = ['DB', 'DOCS', 'ARCHIVE']
    dynamic_env_values = dict.fromkeys(keys, None)

    document_paths = {
        "LOCAL": config.PATH_DOCUMENTS_LOCAL,
        "TEMP": config.PATH_DOCUMENTS_TEMP
    }
    chroma_paths = {
        "LOCAL": config.PATH_CHROMA_LOCAL,
        "TEMP": config.PATH_CHROMA_TEMP
    }
    archive_paths = {
        "LOCAL": config.PATH_ARCHIVE_LOCAL
    }

    if 'var' in str(config.CURRENT_PATH):
        dynamic_env_values['DB'] = chroma_paths['TEMP']
        dynamic_env_values['DOCS'] = document_paths['TEMP']
    else:
        dynamic_env_values['DB'] = chroma_paths['LOCAL']
        dynamic_env_values['DOCS'] = document_paths['LOCAL']
        dynamic_env_values['ARCHIVE'] = archive_paths['LOCAL']

    return dynamic_env_values


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


def main():
    print("running utils.py")


if __name__ == "__main__":
    main()
