# External packages
from langchain_chroma import Chroma
from get_embedding_function import get_embedding_function
import os
# import shutil
import boto3


# Modules
import config

chroma_paths = {
    "LOCAL": config.PATH_CHROMA_LOCAL,
    "LAMBDA": config.PATH_CHROMA_LAMBDA
}


def download_s3_folder(bucket_name, s3_folder, local_dir):
    """
    Downloads the contents of the [s3_folder] in [bucket_name] to [local_dir].
    local_dir will be created if it does not exist.
    """
    try:
        # initialize connection with s3 bucket
        s3 = boto3.client('s3')
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=s3_folder)

        # create local directory if it doesn't exist
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)
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


def initialize(env='local', embedding_function='openai') -> Chroma:
    """
    env can be 'local', or 'lambda' depending on if you're running app locally or on AWS
    """
    chroma_path = chroma_paths[env.upper()]

    # Downloads DB to local /tmp folder first if running on AWS
    match(env.upper()):
        case 'LAMBDA':
            print("Initializing Chroma DB in AWS Lambda")
            try:
                download_s3_folder(config.BUCKET_NAME, 'chroma', chroma_path)
            except Exception as e:
                print(f"Error downloading the Chroma DB from S3: {str(e)}")
                raise
        case 'LOCAL':
            print("Initializing Chroma DB in local environment")

    embedding_function = get_embedding_function("openai")
    try:
        db = Chroma(persist_directory=str(chroma_path),
                    embedding_function=embedding_function)
        print("Initalized Chroma DB")
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise
    return db


def main():
    print("Running initialize_chroma_db.py main function...")
    initialize("local", "openai")


if __name__ == "__main__":
    main()
