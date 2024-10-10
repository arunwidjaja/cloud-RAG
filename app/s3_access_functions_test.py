import boto3
from botocore.exceptions import NoCredentialsError
import config

import os


def main():
    # Initialize the S3 client
    s3 = boto3.client('s3')

    # Download from S3
    # parameters are S3 bucket name, S3 file key, and full destination path
    # you MUST include the name of the destination file, not just the path to it
    # example: 'path/to/your-file.pdf', NOT 'path/to'

    download_location_file = 'C:/Users/Arun Widjaja/Downloads/chroma.sqlite3'
    test_file_key = 'chroma/chroma.sqlite3'
    s3.download_file(config.PATH_BASE_BUCKET,
                     test_file_key, download_location_file)
    print(f"File downloaded successfully")

    s3 = boto3.client('s3')
    response = s3.get_object(Bucket=config.PATH_BASE_BUCKET, Key=test_file_key)

    # Access items in S3


if __name__ == "__main__":
    main()
