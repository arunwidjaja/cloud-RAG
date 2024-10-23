# cloud-RAG

This is a RAG client that allows users to query a database of assorted file types via a web interface. It's currently powered by OpenAI's ADA and GPT-3.5 models, and runs on AWS Lambda.

## Getting Started

The web UI is not currently publicly accessible but you can compile and run the app locally:

1. Update <code>/app/config.py</code> with local Chroma DB and file upload paths.

2. Create <code>/.env</code> and add your <code>OPENAI_API_KEY</code> key.


## Project Stack

- Python
  - Langchain - LLM framework
  - Chroma - Vector DB
  - FastAPI
- Docker, Amazon AWS - Deployment
- HTML, CSS, JavaScript - Frontend

## Architecture

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/cloud_rag_architecture.svg" />



## Development Notes

2024.10.21 - v0.1

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/v0.1.PNG?raw=true" />

v0.1 is the first prototype with all of the basic functionality implemented locally. Database operations can be executed via the frontend UI: uploading files, viewing DB contents/uploads, querying the DB, deleting selected files from the DB, as well as logging DB actions.

Deployment on AWS Lambda has been a learning experience, and working around its read-only nature has revealed nuances in the behavior of the client that I would have otherwise overlooked. Opening a connection to a Chroma database, for instance, requires a writable file system, as there is no way to open a read-only connection. This prevents Lambda from being used for database storage unless the data is copied to the writable /tmp folder first.
Another challenge has been trying to use LangChain's DirectoryLoader class for vectorizing assorted/unknown file types in a single directory. DirectoryLoader attempts to download dependency data, and therefore cannot be used in a read-only file system. More detail on this issue can be found [here](https://github.com/langchain-ai/langchain/issues/17936#issuecomment-2021689653). A workaround that doesn't involve switching to a different cloud service is to parse file extensions with RegEx and call the appropriate loader (TextLoader, PyPDFLoader, etc.), instead of using DirectoryLoader to parse them automatically.

Lambda's temporary storage is a bit unpredictable. The exact conditions that trigger the wiping of the /tmp folder in Lambda are unknown. It often gets wiped after invocations of the Lambda function, only minutes or seconds apart, and doesn't seem to be the appropriate service for this project, even for temporary demonstration purposes. Along with S3 not supporting the functionality to stream a file/database, the originally planned architecture for this project might not be feasible. I'm considering migrating the project over to a different service.  Chroma's officially recommended AWS cloud service for connecting to an instance of their HTTP Client is Amazon EC2, [here](https://docs.trychroma.com/deployment/aws). This would also allow me to use Chroma's native authentication support instead of using IAM permissions to control access to the Lambda function.

