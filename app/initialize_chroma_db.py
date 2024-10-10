# External packages
from langchain_chroma import Chroma
from get_embedding_function import get_embedding_function

# Modules
import config

chroma_paths = {
    'S3': config.PATH_CHROMA_S3,
    'LOCAL': config.PATH_CHROMA_LOCAL,
    'TEMP': config.PATH_CHROMA_TEMP
}

# TODO: add function to copy from S3 to /tmp in AWS Lambdas
# See update_database.py -> copy_to_tmp


def initialize(env='s3', embedding_function="openai") -> Chroma:
    """
    env can be 'local', 'temp', or 's3' depending on if the Chroma DB is on the local machine, AWS Lambda /tmp storage, or AWS S3
    """
    chroma_path = chroma_paths[env.upper()]
    embedding_function = get_embedding_function("openai")

    try:
        db = Chroma(persist_directory=str(chroma_path),
                    embedding_function=embedding_function)
        print("Initalized Chroma DB")
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise
    db_and_path = (db, chroma_path)
    return db_and_path


db_and_path = initialize()
database = db_and_path[0]
database_path = db_and_path[1]


def main():
    initialize("local", "openai")


if __name__ == "__main__":
    main()
