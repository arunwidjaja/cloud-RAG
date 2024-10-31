from imports import *

# Local Modules
import utils
import config
from get_embedding_function import get_embedding_function


def initialize_http(embedding_function='openai') -> Chroma:
    """
    Creates a Chroma instance that connects to the Chroma DB client.
    Chroma server must be running first. Start it from the command line.
    """

    try:
        print("Opening connection to the Chroma DB...")
        http_client = chromadb.HttpClient(
            host='localhost', port=config.PORT_DB)
    except Exception as e:
        print(
            f"An error occurred while initializing the Chroma HTTP Client: {str(e)}")

    # gets the path of the Chroma DB
    chroma_path = utils.get_env_paths()['DB']
    try:
        ef = get_embedding_function(embedding_function)
        print(f"Creating Chroma instance from: {chroma_path}")
        db = Chroma(client=http_client,
                    embedding_function=ef)
    except Exception as e:
        print(
            f"An error occurred while creating a Chroma instance: {str(e)}")
        raise
    return db


def initialize_http_with_auth(embedding_function='openai') -> Chroma:
    try:
        print("Opening connection to the Chroma DB...")
        http_client = chromadb.HttpClient(
            host="localhost",
            port=config.PORT_DB,
            settings=Settings(
                chroma_client_auth_provider="chromadb.auth.basic_authn.BasicAuthClientProvider",
                chroma_client_auth_credentials="asdf:asdf"
            )
        )
    except Exception as e:
        print(
            f"An error occurred while initializing the Chroma HTTP Client: {str(e)}")

    # gets the path of the Chroma DB
    chroma_path = utils.get_env_paths()['DB']
    try:
        ef = get_embedding_function(embedding_function)
        print(f"Creating Chroma instance from: {chroma_path}")
        db = Chroma(client=http_client,
                    embedding_function=ef)

        file_list = utils.get_db_file_names(db, file_name_only=True)
        print(f"Files currently in database:\n{'\n'.join(file_list)}")
    except Exception as e:
        print(
            f"An error occurred while creating a Chroma instance: {str(e)}")
        raise
    return db


def create_htpasswd_file(username, password, filepath="server.htpasswd"):
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(), salt).decode()

    # Format the line for the htpasswd file
    entry = f"{username}:{hashed_password}\n"

    # Write to .htpasswd file
    with open(filepath, "a") as file:
        file.write(entry)

    print(f"User {username} added to {filepath}.")


def main():

    # initialize_http()
    initialize_http_with_auth()


if __name__ == "__main__":
    main()


# def do_not_run():
#     try:
#         print("Opening connection to Chroma DB...")
#         http_client = chromadb.HttpClient(
#             host=config.HOST, port=config.PORT_DB)

#         print("Starting Chroma DB instance...")
#         ef = get_embedding_function('openai')
#         db = Chroma(
#             embedding_function=ef,
#             client=http_client
#         )

#         print("Pushing files to the DB...")
#         update_database.push_to_database(db)

#         file_list = utils.get_db_file_names(db, file_name_only=True)
#         print(f"Files currently in database:\n{'\n'.join(file_list)}")

#     except Exception as e:
#         print(f"Error occurred while initializing Chroma HTTP Client: {e}")
