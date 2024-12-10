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


def init_paths(user_id: str) -> None:
    """
    Initializes necessary directories
    """
    utils.set_env_paths(user_id)


def main():
    return


if __name__ == "__main__":
    main()
