from dotenv import load_dotenv
import os
from pathlib import Path

SEC_DESC_START = """
This is the constants list for this project.
The constants are grouped by category, not alphabetically.
__________________________________________________________
"""

SEC_DESC_1 = """
Path Constants: File paths and locations
"""

# The path of the folder calling the function
# example: .../app

CURRENT_PATH = Path(__file__).resolve().parent
PATH_CHROMA_LOCAL = CURRENT_PATH / Path('chroma')
PATH_DOCUMENTS = CURRENT_PATH / Path('data')
PATH_DOCUMENTS_ARCHIVE = CURRENT_PATH / Path('data_archive')
PATH_TEMPLATES = CURRENT_PATH / Path('templates')
PATH_STATIC = CURRENT_PATH / Path('templates/static')
BUCKET_NAME = "chroma--use1-az4--x-s3"
PATH_CHROMA_LAMBDA = Path('var/task/tmp/chroma')
PATH_CHROMA_TEMP = PATH_CHROMA_LAMBDA

SEC_DESC_2 = """
LLM and Vector Database Constants
"""
DEFAULT_COLLECTION_NAME = "defaultCollection"
MAX_BATCH_SIZE = 5000
LLM_K = 5
RELEVANCE_THRESHOLD = 0.7
CHUNK_SIZE = 300
CHUNK_OVERLAP = 100

SEC_DESC_3 = """
Authentication Constants: Keys and addresses
"""
HOST = "0.0.0.0"
PORT = 8000
load_dotenv()
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']  # OpenAI API Key

SEC_DESC_END = """

"""


def showAll():
    """
    Prints out all the constants in this python file
    """
    vars = {key: str(value)
            for key, value in globals().items() if key.isupper()}
    columnWidth = max(len(key) for key in vars.keys()) + 10

    for var in vars:
        if ('SEC_DESC_' not in var):
            print(f"{var.ljust(columnWidth, '.'):{columnWidth}}{vars[var]}")
        else:
            print(vars[var])


if __name__ == '__main__':
    showAll()  # Call the function to print constants when the script is run directly
