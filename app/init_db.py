from imports import *

# Local Modules
import config
import utils
from get_embedding_function import get_embedding_function


# TODO: Works when called locally after AWS credentials are configured through terminal, but not when called from Lambda function.
# TODO: Credential issue? Fix through AWS dashboard or change function to accept AWS credentials?


def init_db(embedding_function='openai') -> Chroma:
    embed_function = get_embedding_function(embedding_function)

    # detects the current environment and sets the persist directory
    chroma_path = utils.get_env_paths()['DB']
    data_path = utils.get_env_paths()['DOCS']

    # Initializes the chroma folder and data folder in temporary storage if running on AWS Lambda
    if 'tmp' in str(chroma_path):
        try:
            utils.copy_directory(
                config.PATH_CHROMA_LOCAL, chroma_path)
            utils.copy_directory(
                config.PATH_DOCUMENTS_LOCAL, data_path)
        except Exception as e:
            print(
                f"Error copying the Chroma DB to the temporary folder: {str(e)}")
            raise

    # Initializes the DB
    try:
        print(f"Initializing Chroma DB at: {chroma_path}")
        db = Chroma(persist_directory=str(chroma_path),
                    embedding_function=embed_function)
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise
    return db


def init_http_db(embedding_function='openai') -> Chroma:
    """
    Creates a Chroma instance that connects to the Chroma DB client.
    Chroma server must be running first. Start it from the command line.
    """

    try:
        print("Opening connection to the Chroma DB...")
        http_client = chromadb.HttpClient(
            host='localhost', port=config.PORT_DB)
    except Exception as e:
        print(
            f"An error occurred while initializing the Chroma HTTP Client: {str(e)}")

    # gets the path of the Chroma DB
    chroma_path = utils.get_env_paths()['DB']
    try:
        ef = get_embedding_function(embedding_function)
        print(f"Creating Chroma instance from: {chroma_path}")
        db = Chroma(client=http_client,
                    embedding_function=ef)
    except Exception as e:
        print(
            f"An error occurred while creating a Chroma instance: {str(e)}")
        raise
    return db


def main():
    return


if __name__ == "__main__":
    main()
