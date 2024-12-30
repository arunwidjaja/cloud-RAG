# External Modules
from langchain_chroma import Chroma

import chromadb

# Local Modules
from get_embedding_function import get_embedding_function
from paths import get_paths, set_env_paths


def init_db(collection_name: str, embedding_function: str = 'openai') -> Chroma:
    """
    Creates a Chroma (LangChain) instance that connects to a Chroma DB.

    Args:
        collection_name: the name of the default collection. Chroma DB requires at least one collection

    Returns:
        The LangChain Chroma object pointing to the DB
    """
    chroma_path = get_paths().DB_MAIN
    ef = get_embedding_function(embedding_function)

    try:
        print("Connecting to the Chroma DB at:")
        print(f"...{'/'.join(chroma_path.parts[-3:])}")
        persistent_client = chromadb.PersistentClient(
            path=str(chroma_path)
        )
        existing_collections = persistent_client.list_collections()
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
    set_env_paths(user_id)


def main():
    return


if __name__ == "__main__":
    main()
