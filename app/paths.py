# External Modules
from dataclasses import dataclass
from enum import auto, Enum
from pathlib import Path

import os

# Local Modules
from utils import strip_text

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
    AUTH = auto()
    CHATS = auto()
    DB = auto()
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
    def AUTH(self) -> Path:
        return self._paths[PathType.AUTH]

    @property
    def CHATS(self) -> Path:
        return self._paths[PathType.CHATS]

    @property
    def DB(self) -> Path:
        return self._paths[PathType.DB]

    @property
    def UPLOADS(self) -> Path:
        return self._paths[PathType.UPLOADS]


class PathRegistry:
    def __init__(self):
        self._path_configs = {
            PathType.DB: PathConfig(config.PATH_CHROMA_LOCAL, config.PATH_CHROMA_EFS),
            PathType.UPLOADS: PathConfig(config.PATH_UPLOADS_LOCAL, config.PATH_UPLOADS_EFS),
            PathType.ATTACHMENTS: PathConfig(config.PATH_ATTACHMENTS_LOCAL, config.PATH_ATTACHMENTS_EFS),
            PathType.ARCHIVE: PathConfig(config.PATH_ARCHIVE_LOCAL, config.PATH_ARCHIVE_EFS),
            PathType.CHATS: PathConfig(config.PATH_CHATS_LOCAL, config.PATH_CHATS_EFS),
            PathType.AUTH: PathConfig(
                config.PATH_AUTH_LOCAL, config.PATH_AUTH_EFS)
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
        Does not initialize the emebedding database, because that is user-dependent.
        """
        print("Initializing resource paths...")
        storage_type = self.get_storage_type()

        # Initialize base paths
        for path_type, config in self._path_configs.items():
            base_path = config.paths[storage_type]
            self._base_paths[path_type] = base_path

            if not os.path.exists(base_path):
                os.makedirs(base_path)
                print(f"Creating directory: ...{str(base_path)[-50:]}")
            else:
                print(f"Located directory: ...{str(base_path)[-50:]}")

        # Initialize authentication database
        auth_db = self._base_paths[PathType.AUTH] / "users.db"
        auth_db.touch()

        self._user_paths = self._base_paths.copy()

    def set_user_paths(self, user_id: str):
        """
        Initializes user-specific paths.
        Adds the user ID as a subfolder to the base paths.
        """
        self._user_paths = self._base_paths.copy()

        for path_type, base_path in self._base_paths.items():
            if path_type != PathType.AUTH and not os.path.isfile(base_path):
                user_path = base_path / strip_text(user_id)
                self._user_paths[path_type] = user_path
                os.makedirs(user_path, exist_ok=True)
                print(f"Verified user's path exists: ...{
                      str(user_path)[-50:]}")


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
