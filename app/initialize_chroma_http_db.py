import chromadb
from langchain_chroma import Chroma
import config
from get_embedding_function import get_embedding_function
import update_database

import utils


try:
    print("Opening connection to Chroma DB...")
    http_client = chromadb.HttpClient(host=config.HOST, port=config.PORT_DB)

    print("Starting Chroma DB instance...")
    ef = get_embedding_function('openai')
    db = Chroma(
        embedding_function=ef,
        client=http_client
    )

    print("Pushing files to the DB...")
    update_database.push_to_database(db)

    file_list = utils.get_db_file_names(db, file_name_only=True)
    print(f"Files currently in database:\n{'\n'.join(file_list)}")

except Exception as e:
    print(f"Error occurred while initializing Chroma HTTP Client: {e}")
