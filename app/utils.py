from langchain_chroma import Chroma
import initialize_chroma_db
import re
from typing import Tuple, List


def get_db_files(db: Chroma) -> List:
    """
    Gets a list of all unique source files in the Chroma DB.
    """
    db_files = db.get()["ids"]
    db_files_names = []
    for file in db_files:
        file_trim = file.split('\\')[-1]  # gets file name
        file_trim = re.sub(r':\d+:\d+$', '', file_trim)  # trims off tags
        if file_trim not in db_files_names:
            db_files_names.append(file_trim)
    return sorted(db_files_names)


def build_response_string(response_with_context: Tuple[str, List[Tuple[str, any]]]) -> str:
    """
    Accepts a Tuple containing the LLM response and the relevant context.
    The LLM response is a string.
    The relevant context is a List of Tuple, each with the context text and the file path.
    """
    response_string = f"{response_with_context[0]}\n"

    # iterate through each context and append the actual text and the file name to the response string
    for i in range(len(response_with_context[1])):
        context_current = response_with_context[1][i]

        context_current_text = context_current[0].replace("\n", " ")
        file_name = context_current[1].split('\\')[-1]

        context_summary = f"Source #{
            i + 1}: {file_name}\n...{context_current_text}...\n"
        response_string = "\n".join([response_string, context_summary])
    return response_string


def main():
    print("Files currently in DB: ")
    print(get_db_files(initialize_chroma_db.initialize('local')))


if __name__ == "__main__":
    main()
