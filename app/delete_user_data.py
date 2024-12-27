# External Modules
import os
import shutil

# Local Modules
import utils


def delete_user_data(user_id: str):
    base_paths = utils.get_env_base_paths()
    for key, path in base_paths.items():
        user_data_path = base_paths[key] / utils.strip_text(user_id)
        if os.path.exists(user_data_path):
            print(f"Deleting user data in: {user_data_path}")
            shutil.rmtree(user_data_path)
