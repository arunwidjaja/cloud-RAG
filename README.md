# cloud-RAG

This is a RAG service that allows users to query a database of assorted file types via a web interface. It's currently powered by OpenAI's ADA and GPT-3.5 models, and runs on AWS Lambda.

## Getting Started

The web UI is not currently publicly accessible but you can compile and run the app locally:

1. Update <code>/app/config.py</code> with local Chroma DB paths.

2. Create <code>/.env</code> and add your <code>OPENAI_API_KEY</code> key.

3. Save input documents in <code>/app/data</code>

<code>/app/_run_gui.py</code> Provides a GUI for running basic functions such as loading and clearing the database, as well as submitting queries.


## Project Stack

- Python
  - Langchain - LLM framework
  - Chroma - Vector DB
  - FastAPI
- Docker, Amazon AWS - Deployment
- HTML, JavaScript - Frontend

## Roadmap

In development:
- migrating to persistent storage on Amazon S3
- adding CLI
- displaying database contents on web UI

Requested features:
- enabling file upload via frontend
- adding support for local GPU-accelerated models (Mistral, LlaMa, etc.)
- audio transcription


