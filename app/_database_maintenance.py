from imports import *

# Local Modules
import config
import utils

# This file is for development use only.
# Don't use any of these functions in production code.
# Don't import this file into any modules


def resetDB(db_path=config.PATH_CHROMA_LOCAL):
    client = chromadb.Client(
        chromadb.config.Settings(
            persist_directory=str(db_path),
            allow_reset="True"
        )
    )
    client.reset()


def getDBSize(db_path=config.PATH_CHROMA_LOCAL):
    utils.get_folder_size(db_path, print_all=True)


def purgeDB(db_path=config.PATH_CHROMA_LOCAL):
    """
    Deletes the chroma folder's contents
    """
    print(f"Purging the Chroma DB at: {db_path}")
    for item in os.listdir(db_path):
        item_path = os.path.join(db_path, item)
        # Remove files and directories
        if os.path.isfile(item_path):
            os.remove(item_path)
        elif os.path.isdir(item_path):
            shutil.rmtree(item_path)

# PS Commands
# chroma utils vacuum --path "C:/Users/Arun Widjaja/Documents/_PERSONAL_DOCUMENTS/Programs - Python/openAIRAG/app/chroma"


def main():
    print("Starting Maintenance Tasks")
    print("==========================")
    # resetDB()
    # getDBSize()
    purgeDB()


if __name__ == "__main__":
    main()
