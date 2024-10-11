# Creates a basic GUI for ease of testing

# External packages
import tkinter as tk

# Modules
import update_database
import initialize_chroma_db
from query_data import query_rag
import utils


# Initializes the database and starts the GUI
def start_GUI():
    # Initialize DB and GUI
    db = initialize_chroma_db.initialize()
    root = tk.Tk()

    # updates field with the list of documents in the database.
    def load_document_list():
        doc_list = "\n".join(utils.get_db_files(db))
        doc_list_message = "Documents found in the database: " + "\n" + doc_list
        document_list_label.config(text=doc_list_message)

    # queries RAG, prints response
    def submit_query():
        user_input = text_field.get()  # Get the input from the text field
        response = query_rag(db, user_input)
        print_response(response)

    def print_response(response):
        output_label.config(text=response)

    # Main window
    root.geometry("1280x720")
    root.title("OpenAI RAG")

    # Upload
    upload_button = tk.Button(
        root,
        text="Update Chroma DB",
        command=lambda: update_database.add_to_database(db))
    # Document list
    document_list_label = tk.Label(
        root,
        text="Loading documents list...",
        borderwidth=2,
        relief="solid",
        wraplength=600,
        padx=10,
        pady=10)
    # Text entry field
    label = tk.Label(
        root,
        text="Enter your query:")
    text_field = tk.Entry(
        root,
        width=50)
    # Submit query field
    submit_button = tk.Button(
        root,
        text="Submit Query",
        command=submit_query)
    # Response field
    output_label = tk.Label(
        root,
        text="[Submit query to get response]",
        borderwidth=2,
        relief="solid",
        wraplength=600,
        padx=10,
        pady=10)

    # Display GUI
    upload_button.pack(pady=10)
    label.pack(pady=10)
    text_field.pack(pady=10)
    submit_button.pack(pady=10)
    document_list_label.pack(pady=10)
    load_document_list()
    output_label.pack(pady=10)

    # Run the application
    root.mainloop()


def main():
    print("Running _run_gui main function...")
    start_GUI()


if __name__ == "__main__":
    main()

    # test_button = tk.Button(
    #     root,
    #     text="Run test queries",
    #     command=test_rag.run_tests)

    # clear_button = tk.Button(
    #     root,
    #     text="Wipe DB",
    #     command=update_database.clear_database)

    # reset_button = tk.Button(
    #     root,
    #     text="Reset DB (wipe DB and upload data)",
    #     command=update_database.reset_database)
    # test_button.pack(pady=10)
    # clear_button.pack(pady=10)
    # reset_button.pack(pady=10)
    # Text entry field + label
    # test_button.pack(pady=10)
    # clear_button.pack(pady=10)
    # reset_button.pack(pady=10)
