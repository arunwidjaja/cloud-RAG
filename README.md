# cloud-RAG

Cloud RAG is a web-based RAG GenAI client that allows users to query a database of assorted file types via a chat-style web interface. It can also generate document summaries, as well as sentiment and theme analyses.
Text transformation, embedding, and generation is currently powered primarily by DistilBERT, ADA, and GPT-4.

Currently, Cloud RAG does not support local LLMs.

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
- Docker, Amazon AWS - Deployment
- HTML, CSS, JavaScript - Frontend

## Developer Notes

### 2024.11.04 - v0.2

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/v0.2.PNG" />

#### Summary
- Document summary shortcut
- Theme analysis shortcut
- File download
- Chat-style interface
- Security updates

v0.2 contains new key features as well as some added utilities. Shortcuts have been added to the sidebar for document analysis presets, such as summarizing DB documents and extracting main themes with supporting documentation. Documents are analyzed for sentiment and pushed to the DB with sentiment data, which will be used for sentiment analysis in a future update. The client now displays output in a chat-style interface with user and client chat 'bubbles,' and any source files associated with a RAG response can now be downloaded directly from the conversation UI. The backend also stores any source files pushed to the DB, which can be downloaded by the user.

Document retrieval has been updated to use md5 hashes instead of file paths. Any backend paths as well as source file paths are not revealed to the frontend logic.

A library of prompt templates have been added. General purpose templates as well as templates tuned for specific use cases, such as analyzing for themes, sentiment, etc. are stored in configurable presets.

### 2024.10.21 - v0.1

#### Summary
- First prototype

v0.1 is the first prototype with all of the basic functionality implemented locally. Database operations can be executed via the frontend UI: uploading files, viewing DB contents/uploads, querying the DB, deleting selected files from the DB, as well as logging DB actions.

Deployment on AWS Lambda has been a learning experience, and working around its read-only nature has revealed nuances in the behavior of the client that I would have otherwise overlooked. Opening a connection to a Chroma database, for instance, requires a writable file system, as there is no way to open a read-only connection. This prevents Lambda from being used for database storage unless the data is copied to the writable /tmp folder first.
Another challenge has been trying to use LangChain's DirectoryLoader class for vectorizing assorted/unknown file types in a single directory. DirectoryLoader attempts to download dependency data, and therefore cannot be used in a read-only file system. More detail on this issue can be found [here](https://github.com/langchain-ai/langchain/issues/17936#issuecomment-2021689653). A workaround that doesn't involve switching to a different cloud service is to parse file extensions with RegEx and call the appropriate loader (TextLoader, PyPDFLoader, etc.), instead of using DirectoryLoader to parse them automatically.

The exact conditions that trigger the wiping of the /tmp folder in Lambda are unknown. It often gets wiped after invocations of the Lambda function, only minutes or seconds apart, and doesn't seem to be the appropriate service for this project, even for temporary demonstration purposes. Along with S3 not supporting the functionality to stream a file/database, the originally planned architecture for this project might not be feasible. I'm considering migrating the project over to a different service.  Chroma's officially recommended AWS cloud service for connecting to an instance of their HTTP Client is Amazon EC2, [here](https://docs.trychroma.com/deployment/aws). This would also allow me to use Chroma's native authentication support instead of using IAM permissions to control access to the Lambda function.

