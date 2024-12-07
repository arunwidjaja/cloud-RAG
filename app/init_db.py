from imports import *

# Local Modules
import config
import utils
from get_embedding_function import get_embedding_function


def init_db(user_id: str, collection_name: str, embedding_function='openai') -> Chroma:
    """
    Creates a Chroma (LangChain) instance that connects to a Chroma DB.

    Args:
        user: UUID of user
        collection_name: the name of the default collection. Chroma DB requires at least one collection

    Returns:
        The LangChain Chroma object pointing to the DB
    """
    chroma_path = utils.get_env_paths()['DB']
    print(f"The current chroma_path is {chroma_path}")
    ef = get_embedding_function(embedding_function)

    try:
        print(f"Connecting to the Chroma DB at {chroma_path}")
        persistent_client = chromadb.PersistentClient(
            path=str(chroma_path)
        )
        existing_collections = persistent_client.list_collections()
        print("Collections currently in the DB: ")
        print(existing_collections)
        if not existing_collections:
            default_collection = collection_name
        else:
            default_collection = existing_collections[0].name
        db = Chroma(
            collection_name=default_collection,
            client=persistent_client,
            embedding_function=ef
        )
        return db
    except Exception as e:
        print(f"There was an error connecting to the Chroma DB: {e}")
        raise


# def init_http_db(collection_name=config.DEFAULT_COLLECTION_NAME, embedding_function='openai', host_arg='localhost', port_arg=config.PORT_DB) -> Chroma:
#     """
#     Creates a Chroma (LangChain) instance that connects to an HTTP Chroma DB.
#     Defaults to localhost.
#     Chroma server must be running first. Start it from the command line.
#     """
#     ef = get_embedding_function(embedding_function)
#     try:
#         print("Connecting to the Chroma HTTP client at {host_arg}:{port_arg}")
#         http_client = chromadb.HttpClient(
#             host=host_arg,
#             port=port_arg
#         )
#         existing_collections = http_client.list_collections()
#         if not existing_collections:
#             default_collection = collection_name
#         else:
#             default_collection = existing_collections[0].name
#         db = Chroma(
#             collection_name=default_collection,
#             client=http_client,
#             embedding_function=ef)
#         return db
#     except Exception as e:
#         print(f"There was an error connecting to the Chroma DB: {str(e)}")
#         raise


def init_paths(user_id: str) -> None:
    """
    Initializes necessary directories
    """
    utils.set_env_paths(user_id)


def main():
    return


if __name__ == "__main__":
    main()
