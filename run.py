import update_database
from query_data import query_rag
import test_rag

# GUI
import tkinter as tk
from tkinter import messagebox

# update_database.reset_database()
# test_rag.run_tests()
# query_rag("For how much money did Sunja sell her watch? Who gave Sunja that watch?")


# Create the main window
root = tk.Tk()
root.title("openAI RAG")

# Create buttons

upload_button = tk.Button(
    root, text="Upload to Database", command=update_database.add_to_database)
upload_button.pack(pady=10)

test_button = tk.Button(root, text="Test Database",
                        command=test_rag.run_tests)
test_button.pack(pady=10)

clear_button = tk.Button(root, text="Clear Database",
                         command=update_database.clear_database)
clear_button.pack(pady=10)

reset_button = tk.Button(
    root, text="Reset Database (Clear and Upload)", command=update_database.reset_database)
reset_button.pack(pady=10)


# Run the application
root.mainloop()
