from dotenv import load_dotenv
import os
from pathlib import Path


# Server
port = 8000

# API Keys
load_dotenv()
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']  # OpenAI API Key

# Directories
# These are not Paths. These are the names of the subdirectories which will be appended to the base path.
DIR_CHROMA = 'chroma'
DIR_MD = 'data/md'
DIR_PDF = 'data/pdf'
DIR_TEMPLATES = 'templates'
DIR_STATIC = 'templates/static'

# Paths
BASE_PATH = Path(__file__).resolve().parent  # Base directory path
PATH_CHROMA_LOCAL = BASE_PATH / DIR_CHROMA
PATH_CHROMA_TEMP = '/tmp'
PATH_CHROMA_S3 = 'chroma'
PATH_PDF = BASE_PATH / DIR_PDF
PATH_MD = BASE_PATH / DIR_MD
PATH_TEMPLATES = BASE_PATH / DIR_TEMPLATES
PATH_STATIC = BASE_PATH / DIR_STATIC

# LLM Parameters
MAX_BATCH_SIZE = 5000
LLM_K = 5
RELEVANCE_THRESHOLD = 0.7

# Text Splitter Parameters
CHUNK_SIZE = 300
CHUNK_OVERLAP = 100
