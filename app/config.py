from imports import *

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

PATH_CHROMA_LOCAL = CURRENT_PATH / Path('chroma')
PATH_CHROMA_EFS = EFS_PATH / Path('chroma')

PATH_UPLOADS_LOCAL = CURRENT_PATH / Path('uploads')
PATH_UPLOADS_EFS = EFS_PATH / Path('uploads')

PATH_ATTACHMENTS_LOCAL = CURRENT_PATH / Path('attachments')
PATH_ATTACHMENTS_EFS = EFS_PATH / Path('attachments')

PATH_ARCHIVE_LOCAL = CURRENT_PATH / Path('archive')
PATH_ARCHIVE_EFS = EFS_PATH / Path('archive')

PATH_CHATS_LOCAL = CURRENT_PATH / Path('chats')
PATH_CHATS_EFS = EFS_PATH / Path('chats')

PATH_AUTH_LOCAL = CURRENT_PATH / Path("auth")
PATH_AUTH_EFS = EFS_PATH / Path("auth")

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
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Store this in .env file

OTP_LIFESPAN_MINUTES = 15

HOST = "0.0.0.0"
PORT_APP = 8000
PORT_DB = 8001


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
