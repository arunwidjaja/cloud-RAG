from dotenv import load_dotenv
import os
from pathlib import Path


# Server
port = 8000

# API Keys
load_dotenv()
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']  # OpenAI API Key

# Directories


# These are paths below the 'app' folder
DIR_CHROMA = 'chroma'
DIR_MD = 'data/md'
DIR_PDF = 'data/pdf'
DIR_TEMPLATES = 'templates'
DIR_STATIC = 'templates/static'
DIR_CHROMA_TEMP = 'tmp/chroma'


# Paths, URLs, Names, and other harcoded identifiers

# Find the path from root directory first

PATH_BASE_LOCAL = Path(__file__).resolve().parent
PATH_BASE_TEMP = Path(__file__).resolve().parent
PATH_BASE_BUCKET = "chroma--use1-az4--x-s3"

PATH_CHROMA_LOCAL = str(PATH_BASE_LOCAL / DIR_CHROMA)
PATH_CHROMA_TEMP = str(PATH_BASE_TEMP / DIR_CHROMA)
PATH_CHROMA_S3 = str(Path(PATH_BASE_BUCKET) / DIR_CHROMA)


PATH_PDF = str(PATH_BASE_LOCAL / DIR_PDF)
PATH_MD = str(PATH_BASE_LOCAL / DIR_MD)
PATH_TEMPLATES = str(PATH_BASE_LOCAL / DIR_TEMPLATES)
PATH_STATIC = str(PATH_BASE_LOCAL / DIR_STATIC)


# LLM Parameters
MAX_BATCH_SIZE = 5000
LLM_K = 5
RELEVANCE_THRESHOLD = 0.7

# Text Splitter Parameters
CHUNK_SIZE = 300
CHUNK_OVERLAP = 100


# Aliases
URL_BUCKET = PATH_BASE_BUCKET
NAME_BUCKET = PATH_BASE_BUCKET
PATH_BASE_TEMP = PATH_BASE_LOCAL


def showAll():
    constants_dict = {name: value for name,
                      value in globals().items() if name.isupper()}
    for name, value in constants_dict.items():
        print(f"{name} = {value}")


if __name__ == '__main__':
    showAll()


def showAll():
    constants_dict = {name: value for name,
                      value in globals().items() if name.isupper()}
    for name, value in constants_dict.items():
        print(f"{name} = {value}")


if __name__ == '__main__':
    showAll()  # Call the function to print constants when the script is run directly
