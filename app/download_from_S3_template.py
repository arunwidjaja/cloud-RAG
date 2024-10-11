import boto3
from botocore.exceptions import NoCredentialsError
import config

import os


def download_s3_folder(bucket_name, s3_folder, local_dir):
    try:
        s3 = boto3.client('s3')
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=s3_folder)
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
    # replace local_dir with tmp/chroma
    local_dir = 'C:/Users/Arun Widjaja/Downloads/chroma'  # Local folder to save
    download_s3_folder(config.NAME_BUCKET, 'chroma/', local_dir)


if __name__ == "__main__":
    main()
