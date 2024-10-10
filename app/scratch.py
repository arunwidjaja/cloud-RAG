import boto3
from botocore.exceptions import NoCredentialsError

BUCKET_NAME = "chroma--use1-az4--x-s3"
FILE_KEY = "testfile.txt"
LOCAL_FILE_PATH = "C:/Users/Arun Widjaja/Downloads/s3file.txt"


def download_file_from_s3(bucket_name, s3_file_key, local_file_path):
    """
    Downloads a file from an S3 bucket to the local file system.

    :param bucket_name: The name of the S3 bucket
    :param s3_file_key: The key (path) of the file in the S3 bucket
    :param local_file_path: The local file path where the file will be saved
    """
    # Initialize the S3 client
    s3 = boto3.client('s3')

    try:
        # Download the file
        s3.download_file(bucket_name, s3_file_key, local_file_path)
        print(f"File downloaded successfully to {local_file_path}")
    except FileNotFoundError:
        print(f"The local file path {local_file_path} does not exist.")
    except NoCredentialsError:
        print("AWS credentials not available.")
    except Exception as e:
        print(f"An error occurred: {e}")


download_file_from_s3(BUCKET_NAME, FILE_KEY, LOCAL_FILE_PATH)
