import chromadb.config
import config
import shutil
import utils
import chromadb


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
    Deletes the entire chroma folder. Cannot be used while DB has been initialized.
    """
    print("Purging the Chroma DB at: ")
    shutil.rmtree(db_path)

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
