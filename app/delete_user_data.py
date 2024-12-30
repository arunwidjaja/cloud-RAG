# External Modules
import os
import shutil

# Local Modules
from pathlib import Path
from paths import get_base_paths


def delete_user_data(user_id: str):
    base_paths = get_base_paths()
    for path_type in dir(base_paths):
        base_path: Path = getattr(base_paths, path_type)

        if isinstance(base_path, property):
            user_data_path = base_path / user_id
            if os.path.exists(user_data_path):
                print(f"Deleting user data in: {user_data_path}")
                shutil.rmtree(user_data_path)
