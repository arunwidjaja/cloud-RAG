# Creates a basic GUI for ease of testing

# External packages
import tkinter as tk
from tkinter import messagebox

# Modules
import update_database
from query_data import query_rag
import test_rag


def start_GUI():

    # queries RAG, prints response
    def submit_query():
        user_input = text_field.get()  # Get the input from the text field
        response = query_rag(user_input)
        print_response(response)

    def print_response(response):
        output_label.config(text=response)

    # Main window
    root = tk.Tk()
    root.geometry("1280x720")
    root.title("OpenAI RAG")

    # Upload, test, clear and reset buttons
    upload_button = tk.Button(
        root,
        text="Store data in Chroma DB",
        command=update_database.add_to_database)

    test_button = tk.Button(
        root,
        text="Run test queries",
        command=test_rag.run_tests)

    clear_button = tk.Button(
        root,
        text="Wipe DB",
        command=update_database.clear_database)

    reset_button = tk.Button(
        root,
        text="Reset DB (wipe DB and upload data)",
        command=update_database.reset_database)

    # Text entry field + label
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
    test_button.pack(pady=10)
    clear_button.pack(pady=10)
    reset_button.pack(pady=10)
    label.pack(pady=10)
    text_field.pack(pady=10)
    submit_button.pack(pady=10)
    output_label.pack(pady=10)

    # Run the application
    root.mainloop()


def main():
    start_GUI()


if __name__ == "__main__":
    main()
