import boto3
from botocore.exceptions import NoCredentialsError
import config
import os


# you MUST include the name of the output file, not just the path to it
# example: 'path/to/your-file.pdf', NOT 'path/to'
download_location_file = 'C:/Users/Arun Widjaja/Downloads/chroma.sqlite3'
test_file_key = 'chroma/chroma.sqlite3'


def main():
    """
        Downloads a file from an S3 bucket to the local file system.
        :param bucket_name: The name of the S3 bucket
        :param s3_file_key: The key (path) of the file in the S3 bucket
        :param local_file_path: The local file path where the file will be saved
        """
    # Initialize the S3 client
    s3 = boto3.client('s3')
    # s3.download_file('chroma--use1-az4--x-s3', 'chroma/chroma.sqlite3',
    #                  'C:/Users/Arun Widjaja/Downloads/chroma.sqlite3')
    s3.download_file(config.PATH_BASE_BUCKET,
                     test_file_key, download_location_file)

    print(f"File downloaded successfully")

    # s3://chroma--use1-az4--x-s3/chroma/chroma.sqlite3


if __name__ == "__main__":
    main()
