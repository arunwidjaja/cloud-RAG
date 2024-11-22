# Cloud RAG

Cloud RAG is a Retrieval-Augmented Generation client that allows users to query a database of assorted file types via a chat-style web interface. It can also generate document summaries, as well as sentiment and theme analyses.
Text transformation, embedding, and generation is currently powered primarily by DistilBERT, ADA, and GPT-4.

## Getting Started

Cloud RAG can be compiled and run locally, but requires OpenAI API keys:

1. Update <code>/app/config.py</code> with local Chroma DB and file upload paths.

2. Update <code>/.env</code> and add your <code>OPENAI_API_KEY</code> key.

3. LLM paramters can be configured in <code>/app/config.py</code>. Prompt templates and presets can be configured in <code>/app/prompt_templates.py</code>


## Project Stack

- Python
  - Langchain - LLM framework
  - HuggingFace - Transformers
  - Chroma - Vector DB
  - FastAPI
- ReactJS, Vite, Docker, Amazon AWS - Deployment
- TypeScript, Tailwind CSS - Frontend

## Release Notes

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/v0.4_2.PNG" />

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/v0.4_1.PNG" />

### 2024.11.21 - v0.4
- UI overhaul
  - Theme switcher
  - Tab panel for RAG, database, and uploads
  - Navbar and sidebar
- Migration to TypeScript, Tailwind CSS, and Vite

### 2024.11.13 - v0.3
- Migration to React.JS

### 2024.11.04 - v0.2
#### Feature Summary
- Document summary shortcut
- Theme analysis shortcut
- File download from context
- Chat-style interface
- Security updates

v0.2 contains new key features as well as some added utilities. Shortcuts have been added to the sidebar for document analysis presets, such as summarizing DB documents and extracting main themes with supporting documentation. Documents are analyzed for sentiment and pushed to the DB with sentiment data, which will be used for sentiment analysis in a future update. The client now displays output in a chat-style interface with user and client chat 'bubbles,' and any source files associated with a RAG response can now be downloaded directly from the conversation UI. The backend also stores any source files pushed to the DB, which can be downloaded by the user.

Document retrieval has been updated to use md5 hashes instead of file paths. Any backend paths as well as source file paths are not revealed to the frontend logic.

A library of prompt templates has been added. General purpose templates as well as templates tuned for specific use cases, such as analyzing for themes, sentiment, etc. are stored in configurable presets.

### 2024.10.21 - v0.1

#### Feature Summary
- RAG querying
- File operations: upload, download, delete
- Logging window

v0.1 is the first prototype with all of the basic client functionality implemented locally. Database operations can be executed via the frontend UI: uploading files, viewing DB contents/uploads, querying the DB, deleting selected files from the DB, as well as logging DB actions.

The originally planned architecture was to have Cloud RAG deployed on AWS Lambda, but the read-only file system is too restrictive. DirectoryLoader cannot be used to load multiple file types from a single directory because it requires a writable file system to download nltk dependency data. Currently, the best solution is to preprocess data into a single format and use the appropriate loader, or to manually parse file extensions rather than rely on DirectoryLoader. The /tmp folder for the Lambda function is erased after every invocation of the FastAPI handler and cannot be used to store data, even during a single session. This project will be moved to a different Cloud serivce; AWS EC2 and S3 are officially supported and have documentation [here](https://docs.trychroma.com/deployment/aws).

More detail on the DirectoryLoader issue can be found [here](https://github.com/langchain-ai/langchain/issues/17936#issuecomment-2021689653).

