# External Modules
from dataclasses import dataclass
from enum import auto, Enum
from pathlib import Path

import os

# Local Modules
import config


# This class is for maintaining the paths of resource folders.
# The paths are accessed with get_env_user_paths
# To add new paths to the registry:
#   0.  Add the new paths to the config file
#   1.  Update PathType with the new path type
#   2.  Update UserPathsWrapper with the new path type
#   3.  Update the PathRegistry initialization to assign the new LOCAL/EFS paths


class StorageType(Enum):
    LOCAL = "LOCAL"
    EFS = "EFS"


class PathConfig:
    def __init__(self, local_path: Path, efs_path: Path):
        self.paths = {
            StorageType.LOCAL: local_path,
            StorageType.EFS: efs_path
        }


class PathType(Enum):
    ARCHIVE = auto()
    ATTACHMENTS = auto()
    CHATS = auto()
    DB_AUTH = auto()
    DB_MAIN = auto()
    DB_SECONDARY = auto()
    UPLOADS = auto()


@dataclass
class UserPathsWrapper:
    _paths: dict[PathType, Path]

    @property
    def ARCHIVE(self) -> Path:
        return self._paths[PathType.ARCHIVE]

    @property
    def ATTACHMENTS(self) -> Path:
        return self._paths[PathType.ATTACHMENTS]

    @property
    def CHATS(self) -> Path:
        return self._paths[PathType.CHATS]

    @property
    def DB_AUTH(self) -> Path:
        return self._paths[PathType.DB_AUTH]

    @property
    def DB_MAIN(self) -> Path:
        return self._paths[PathType.DB_MAIN]

    @property
    def DB_SECONDARY(self) -> Path:
        return self._paths[PathType.DB_SECONDARY]

    @property
    def UPLOADS(self) -> Path:
        return self._paths[PathType.UPLOADS]


class PathRegistry:
    def __init__(self):
        self._path_configs = {
            PathType.ARCHIVE: PathConfig(
                config.PATH_ARCHIVE_LOCAL,
                config.PATH_ARCHIVE_EFS
            ),
            PathType.ATTACHMENTS: PathConfig(
                config.PATH_ATTACHMENTS_LOCAL,
                config.PATH_ATTACHMENTS_EFS
            ),
            PathType.CHATS: PathConfig(
                config.PATH_CHATS_LOCAL,
                config.PATH_CHATS_EFS
            ),
            PathType.DB_AUTH: PathConfig(
                config.PATH_DB_AUTH_LOCAL,
                config.PATH_DB_AUTH_EFS
            ),
            PathType.DB_MAIN: PathConfig(
                config.PATH_DB_MAIN_LOCAL,
                config.PATH_DB_MAIN_EFS
            ),
            PathType.DB_SECONDARY: PathConfig(
                config.PATH_DB_SECONDARY_LOCAL,
                config.PATH_DB_SECONDARY_EFS
            ),
            PathType.UPLOADS: PathConfig(
                config.PATH_UPLOADS_LOCAL,
                config.PATH_UPLOADS_EFS
            )
        }
        self._base_paths: dict[PathType, Path] = {}
        self._user_paths: dict[PathType, Path] = {}

    def get_user_paths(self) -> dict[PathType, Path]:
        return self._user_paths

    def get_base_paths(self) -> dict[PathType, Path]:
        return self._base_paths

    def get_storage_type(self) -> StorageType:
        """
        Returns either "EFS" or "LOCAL".
        Checks if the current path has the word 'var' in it.
        AWS EFS paths start with 'var'.
        """
        return StorageType.EFS if 'var' in str(config.CURRENT_PATH) else StorageType.LOCAL

    def initialize_paths(self):
        """
        Initializes resource paths and authentication database.
        Creates the paths if they don't exist.
        """
        print("Initializing resource paths:")
        storage_type = self.get_storage_type()

        for path_type, config in self._path_configs.items():
            base_path = config.paths[storage_type]
            self._base_paths[path_type] = base_path
            print(f"...{'/'.join(base_path.parts[-2:])}")
            if not os.path.exists(base_path):
                os.makedirs(base_path)

        print(f"Initializing authentication DB:")
        auth_db = self._base_paths[PathType.DB_AUTH] / "users.db"
        print(f"...{'/'.join(auth_db.parts[-3:])}")
        auth_db.touch()

        self._user_paths = self._base_paths.copy()

    def set_user_paths(self, user_id: str):
        """
        Initializes user-specific paths.
        Adds the user ID as a subfolder to the base paths.
        """
        self._user_paths = self._base_paths.copy()

        print("Initializing user's data paths:")
        # Skip over database paths since they are shared among users
        excluded_paths = {PathType.DB_AUTH,
                          PathType.DB_MAIN,
                          PathType.DB_SECONDARY}
        for path_type, base_path in self._base_paths.items():
            if path_type not in excluded_paths:
                user_path = base_path / user_id
                self._user_paths[path_type] = user_path
                os.makedirs(user_path, exist_ok=True)
                print(f"...{'/'.join(user_path.parts[-3:])}")


# Global instance
_path_registry = PathRegistry()


def initialize_paths():
    _path_registry.initialize_paths()


def set_env_paths(user_id: str):
    _path_registry.set_user_paths(user_id)


def get_paths() -> UserPathsWrapper:
    """
    Gets the user paths.

    Example:
        paths = get_env_user_paths()
        upload_path = paths.UPLOADS
    """
    return UserPathsWrapper(_path_registry.get_user_paths())


def get_base_paths() -> UserPathsWrapper:
    return UserPathsWrapper(_path_registry.get_base_paths())


# Initializes paths on module import
initialize_paths()
