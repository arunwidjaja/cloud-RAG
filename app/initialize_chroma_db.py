# External packages
from langchain_chroma import Chroma
from get_embedding_function import get_embedding_function
import os
import shutil
import boto3
import utils


# Modules
import config


# TODO: Works when called locally after AWS credentials are configured through terminal, but not when called from Lambda function.
# TODO: Credential issue? Fix through AWS dashboard or change function to accept AWS credentials?


def initialize(embedding_function='openai') -> Chroma:
    embed_function = get_embedding_function(embedding_function)

    # detects the current environment and sets the persist directory
    chroma_path = utils.get_env_paths()['DB']

    # Initializes the chroma folder in temporary storage if running on AWS Lambda
    if 'var' in str(chroma_path):
        print("Starting copy to AWS Lambda temporary folder.")
        try:
            utils.mirror_directory(
                config.PATH_CHROMA_LOCAL, chroma_path)
        except Exception as e:
            print(
                f"Error copying the Chroma DB to the temporary folder: {str(e)}")
            raise
        # Need to figure out a way to trigger the following code when migrating to S3
        # print("Starting download from AWS S3.")
        # try:
        #     download_s3_folder(config.BUCKET_NAME, 'chroma/', chroma_path)
        # except Exception as e:
        #     print(f"Error downloading the Chroma DB from S3: {str(e)}")
        #     raise

    # Initializes the DB
    try:
        print(f"Initializing Chroma DB at: {chroma_path}")
        db = Chroma(persist_directory=str(chroma_path),
                    embedding_function=embed_function)
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise
    return db


def download_s3_folder(bucket_name, s3_folder, local_dir):
    """
    Downloads the contents of [s3_folder] in [bucket_name] to [local_dir].
    local_dir will be created if it does not exist.
    """
    try:
        # initialize connection with bucket, get list of files in folder
        s3 = boto3.client('s3')
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=s3_folder)

        # create local directory if it doesn't exist
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)

        # Iterate through files in folder and download them
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    s3_key = obj['Key']
                    local_file_path = os.path.join(
                        local_dir, os.path.relpath(s3_key, s3_folder))

                    # Create directories if they don't exist
                    os.makedirs(os.path.dirname(
                        local_file_path), exist_ok=True)

                    # Download the file
                    print(f'Downloading {s3_key} to {local_file_path}')
                    s3.download_file(bucket_name, s3_key, local_file_path)
    except Exception as e:
        print(f"Error downloading from S3: {str(e)}")
        raise
    return True


def main():
    return


if __name__ == "__main__":
    main()
