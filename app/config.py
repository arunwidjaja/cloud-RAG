from dotenv import load_dotenv
import os
from pathlib import Path


# Server
port = 8000

# API Keys
load_dotenv()
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']  # OpenAI API Key


# Local Paths

# The path of the folder calling the function
# example: .../app
CURRENT_PATH = str(Path(__file__).resolve().parent)
PATH_CHROMA_LOCAL = CURRENT_PATH + '\\chroma'
PATH_PDF = CURRENT_PATH + '\\data\\pdf'
PATH_MD = CURRENT_PATH + '\\data\\md'
PATH_TEMPLATES = CURRENT_PATH + 'templates'
PATH_STATIC = CURRENT_PATH + '\\templates\\static'


# AWS Paths

BUCKET_NAME = "chroma--use1-az4--x-s3"
# currenlty using temporary storage for working with the database
PATH_CHROMA_LAMBDA = '\\tmp\\chroma'

# LLM Parameters
MAX_BATCH_SIZE = 5000
LLM_K = 5
RELEVANCE_THRESHOLD = 0.7

# Text Splitter Parameters
CHUNK_SIZE = 300
CHUNK_OVERLAP = 100


def showAll():
    constants_dict = {name: value for name,
                      value in globals().items() if name.isupper()}
    for name, value in constants_dict.items():
        print(f"{name} = {value}")


if __name__ == '__main__':
    showAll()  # Call the function to print constants when the script is run directly
