from dotenv import load_dotenv
import os
from pathlib import Path

SEC_DESC_START = """
__________________________________________________________

This is the constants list for this project.
The constants are grouped by category, not alphabetically.
__________________________________________________________
"""

SEC_DESC_1 = """
==============================================
Path Constants: Local file paths and locations
==============================================
"""

# The path of the folder calling the function
# example: .../app
CURRENT_PATH = Path(__file__).resolve().parent

SEC_DESC_1A = """
Resource Paths:
"""

# Local Paths
PATH_CHROMA_LOCAL = CURRENT_PATH / Path('chroma')
PATH_CHROMA_TEMP = Path('/tmp/chroma')
PATH_CHROMA_S3 = PATH_CHROMA_TEMP

PATH_DOCUMENTS_LOCAL = CURRENT_PATH / Path('data')
PATH_DOCUMENTS_TEMP = Path('/tmp/data')
PATH_DOCUMENTS_S3 = PATH_DOCUMENTS_TEMP


PATH_TEMPLATES = CURRENT_PATH / Path('templates')
PATH_STATIC = PATH_TEMPLATES / Path('static')

BUCKET_NAME = "chroma--use1-az4--x-s3"

SEC_DESC_2 = """
=========================
Vector Database Constants
=========================
"""

DEFAULT_COLLECTION_NAME = "defaultCollection"
CHUNK_SIZE = 300
CHUNK_OVERLAP = 100
MAX_BATCH_SIZE = 5000
RELEVANCE_THRESHOLD = 0.7


SEC_DESC_3 = """
=============
LLM Constants
=============
"""

LLM_K = 5

SEC_DESC_4 = """
============================================
Authentication Constants: Keys and addresses
============================================
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
    showAll()
