# External Modules
from dotenv import load_dotenv
from pathlib import Path

import os

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
EFS_PATH = Path('/efs')

SEC_DESC_1A = """
Resource Paths:
"""

# Main database
# Stores embeddings for user's documents
PATH_DB_MAIN_LOCAL = CURRENT_PATH / Path('db_main')
PATH_DB_MAIN_EFS = EFS_PATH / Path('db_main')

# Temporary database
# Stores embeddings for temporary documents, such as attachments
# Can be cleared periodically to save space
PATH_DB_SECONDARY_LOCAL = CURRENT_PATH / Path('db_secondary')
PATH_DB_SECONDARY_EFS = EFS_PATH / Path('db_secondary')

# Authentication database
# Stores credentials and authentication tokens
PATH_DB_AUTH_LOCAL = CURRENT_PATH / Path("db_auth")
PATH_DB_AUTH_EFS = EFS_PATH / Path("db_auth")

# Uploads folder
# Temporary file storage for uploaded documents
PATH_UPLOADS_LOCAL = CURRENT_PATH / Path('data_uploads')
PATH_UPLOADS_EFS = EFS_PATH / Path('data_uploads')

# Attachments folder
# Temporary file storage for attached documents
PATH_ATTACHMENTS_LOCAL = CURRENT_PATH / Path('data_attachments')
PATH_ATTACHMENTS_EFS = EFS_PATH / Path('data_attachments')

# Archived documents folder
# Uploads are moved here after they are pushed
# Downloads fetch documents from here
PATH_ARCHIVE_LOCAL = CURRENT_PATH / Path('data_archive')
PATH_ARCHIVE_EFS = EFS_PATH / Path('data_archive')

# Chat history folder
# User chat history and messages are stored here
PATH_CHATS_LOCAL = CURRENT_PATH / Path('data_chats')
PATH_CHATS_EFS = EFS_PATH / Path('data_chats')


SEC_DESC_2 = """
=========================
Vector Database Constants
=========================
"""

DEFAULT_COLLECTION_NAME = "CloudRag"
DEFAULT_USER_ID = "0"
CHUNK_SIZE = 450
CHUNK_OVERLAP = 100
MAX_BATCH_SIZE = 5000
RELEVANCE_THRESHOLD = 0.7


SEC_DESC_3 = """
=============
LLM Constants
=============
"""

LLM_K = 5
TOKEN_LIMIT = 1000
MAX_CONCURRENCY = 8

ENCODING_TOKENIZER = "cl100k_base"

SENTIMENT_ANALYSIS_MODEL_DEFAULT = 'distilbert-base-uncased-finetuned-sst-2-english'
DEFAULT_MESSAGE_ID = '0'


SEC_DESC_4 = """
============================================
Authentication Constants: Keys and addresses
============================================
"""
load_dotenv()

SMTP_SERVER = "mail.privateemail.com"
SMTP_PORT = 587
SMTP_USERNAME = "verification@ragbase.cloud"
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", default="smtp_pwd")

OTP_LIFESPAN_MINUTES = 15

USERNAME_POSTGRES = os.getenv("POSTGRES_USERNAME", default="postgres_user")
PASSWORD_POSTGRES = os.getenv("POSTGRES_PASSWORD", default="postgres_pwd")
DATABASE = "ragbase"
HOST = "0.0.0.0"
HOST_PG = "localhost"
HOST_PG_RDS = os.getenv("AWS_RDS_ENDPOINT", default="0.0.0.0")
PORT_APP = 8000
PORT_DB_PG = 5432
PORT_DB = 8001

UUID_LENGTH = 16


OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', default="")  # OpenAI API Key

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
