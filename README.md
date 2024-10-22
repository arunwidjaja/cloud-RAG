# cloud-RAG

This is a RAG service that allows users to query a database of assorted file types via a web interface. It's currently powered by OpenAI's ADA and GPT-3.5 models, and runs on AWS Lambda.

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
- HTML, JavaScript - Frontend

## Architecture

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/README_files/cloud_rag_architecture.svg" />



## Development Notes


