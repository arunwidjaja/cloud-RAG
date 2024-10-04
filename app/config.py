import os
from pathlib import Path
from dotenv import load_dotenv

# API Keys
load_dotenv()
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']  # OpenAI API Key

# Directories
DIR_CHROMA = 'chroma'
DIR_MD = 'data/md'
DIR_PDF = 'data/pdf'
DIR_TEMPLATES = 'templates'
DIR_STATIC = 'templates/static'

# Paths
BASE_PATH = Path(__file__).resolve().parent  # Base directory path
PATH_CHROMA = BASE_PATH / DIR_CHROMA
PATH_PDF = BASE_PATH / DIR_PDF
PATH_MD = BASE_PATH / DIR_MD
PATH_TEMPLATES = BASE_PATH / DIR_TEMPLATES
PATH_STATIC = BASE_PATH / DIR_STATIC

# LLM Parameters
MAX_BATCH_SIZE = 1000
