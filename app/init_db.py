from imports import *

# Local Modules
import config
import utils
from get_embedding_function import get_embedding_function


# TODO: Works when called locally after AWS credentials are configured through terminal, but not when called from Lambda function.
# TODO: Credential issue? Fix through AWS dashboard or change function to accept AWS credentials?


def init_db(embedding_function='openai') -> Chroma:
    """
    Creates a Chroma (LangChain) instance that connects to a local Chroma DB.
    """
    chroma_path = utils.get_env_paths()['DB']
    ef = get_embedding_function(embedding_function)

    try:
        print(f"Connecting to the Chroma DB at {chroma_path}")
        persistent_client = chromadb.PersistentClient(
            path=str(chroma_path)
        )
        db = Chroma(
            client=persistent_client,
            embedding_function=ef
        )
        return db
    except Exception as e:
        print(f"There was an error connecting to the Chroma DB: {e}")
        raise


def init_http_db(embedding_function='openai', host_arg='localhost', port_arg=config.PORT_DB) -> Chroma:
    """
    Creates a Chroma (LangChain) instance that connects to an HTTP Chroma DB.
    Defaults to localhost.
    Chroma server must be running first. Start it from the command line.
    """
    ef = get_embedding_function(embedding_function)
    try:
        print("Connecting to the Chroma HTTP client at {host_arg}:{port_arg}")
        http_client = chromadb.HttpClient(
            host=host_arg,
            port=port_arg)
        db = Chroma(
            client=http_client,
            embedding_function=ef)
        return db
    except Exception as e:
        print(f"There was an error connecting to the Chroma DB: {str(e)}")
        raise


def main():
    return


if __name__ == "__main__":
    main()
