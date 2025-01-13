# External Modules
from dotenv import load_dotenv
from pathlib import Path

import os

# Local Modules
import custom_types

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
PATH_CURRENT = Path(__file__).resolve().parent
PATH_EFS = Path('/efs')

SEC_DESC_1A = """
Resource Paths:
"""

# Main database
# Stores embeddings for user's documents
PATH_DB_MAIN_LOCAL = PATH_CURRENT / Path('db_main')
PATH_DB_MAIN_EFS = PATH_EFS / Path('db_main')

# Temporary database
# Stores embeddings for temporary documents, such as attachments
# Can be cleared periodically to save space
PATH_DB_SECONDARY_LOCAL = PATH_CURRENT / Path('db_secondary')
PATH_DB_SECONDARY_EFS = PATH_EFS / Path('db_secondary')

# Authentication database
# Stores credentials and authentication tokens
PATH_DB_AUTH_LOCAL = PATH_CURRENT / Path("db_auth")
PATH_DB_AUTH_EFS = PATH_EFS / Path("db_auth")

# Uploads folder
# Temporary file storage for uploaded documents
PATH_UPLOADS_LOCAL = PATH_CURRENT / Path('data_uploads')
PATH_UPLOADS_EFS = PATH_EFS / Path('data_uploads')

# Attachments folder
# Temporary file storage for attached documents
PATH_ATTACHMENTS_LOCAL = PATH_CURRENT / Path('data_attachments')
PATH_ATTACHMENTS_EFS = PATH_EFS / Path('data_attachments')

# Archived documents folder
# Uploads are moved here after they are pushed
# Downloads fetch documents from here
PATH_ARCHIVE_LOCAL = PATH_CURRENT / Path('data_archive')
PATH_ARCHIVE_EFS = PATH_EFS / Path('data_archive')

# Chat history folder
# User chat history and messages are stored here
PATH_CHATS_LOCAL = PATH_CURRENT / Path('data_chats')
PATH_CHATS_EFS = PATH_EFS / Path('data_chats')


SEC_DESC_2 = """
=========================
Vector Database Constants
=========================
"""

DEFAULT_EMBEDDING = str(custom_types.Embeddings.OPENAI.value)

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
========
API Keys
========
"""
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', default="")


SEC_DESC_5 = """
========================================
Email Server Configuration
========================================
"""

# Email server configuration
SERVER_SMTP = "mail.privateemail.com"
PORT_SMTP = 587
USERNAME_SMTP = "verification@ragbase.cloud"
PASSWORD_SMTP = os.getenv("PASSWORD_SMTP", default="smtp_pwd")

SEC_DESC_6 = """
=====================================
Authentication Database Configuration
=====================================
"""

# Authentication DB configuration
OTP_LIFESPAN_MINUTES = 15
UUID_LENGTH = 16
ENCODING = 'utf-8'

DB_AUTH = "ragbase"
HOST_DB_AUTH_RDS = os.getenv("HOST_DB_AUTH_RDS", default="0.0.0.0")
PORT_DB_AUTH_RDS = 5432
USERNAME_DB_AUTH = os.getenv("USERNAME_DB_AUTH", default="postgres_user")
PASSWORD_DB_AUTH = os.getenv("PASSWORD_DB_AUTH", default="postgres_pwd")

TABLE_USERS = "users"
TABLE_VERIFICATION = "verification"

SEC_DESC_7 = """
================================
Embedding Database Configuration
================================
"""

# Embedding DB configuration
DB_MAIN = "ragbase"
HOST_DB_MAIN_LOCAL = "localhost"
PORT_DB_MAIN_LOCAL = 8001
HOST_DB_MAIN_RDS = os.getenv("HOST_DB_MAIN_RDS", default="0.0.0.0")
PORT_DB_MAIN_RDS = 5432
USERNAME_DB_MAIN = os.getenv("USERNAME_DB_MAIN", default="postgres_user")
PASSWORD_DB_MAIN = os.getenv("PASSWORD_DB_MAIN", default="postgres_pwd")

SEC_DESC_8 = """
=========================
Application Configuration
=========================
"""

# App configuration
PORT_APP_LOCAL = 8000
HOST_APP_LOCAL = "0.0.0.0"


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
