# cloud-RAG

This is a RAG service that allows users to query a database of assorted file types via a web interface. Currently powered by OpenAI's ADA and GPT-3.5 models.

# Getting Started

The web UI is not currently open to the public but you can compile and run the app locally.

<code>/app/config.py</code> needs to be updated with paths for storing the Chroma DB locally.

<code>/.env</code> needs to be created and updated with your OpenAI API key. They key must be named <code>OPENAI_API_KEY</code>

Input documents should be saved in <code>/app/data</code>

<code>/app/_run_gui.py</code> Provides a GUI for running basic functions such as loading and clearing the database, as well as submitting queries


# Project Stack:

<ul>

  -Python - Main logic
  
  -Langchain - LLM framework
  
  -Chroma - Vector DB
  
  -FastAPI, Docker, Amazon AWS - Deployment and hosting
  
  -HTML, JavaScript - Frontend
  
</ul>

# Roadmap

In development:
- migrating to persistent storage on Amazon S3
- adding CLI commands
- display database contents on web UI

Possible features:
- allowing front-end file upload
- adding support for locally hosted GPU-accelerated models (Mistral, LlaMa, etc.)
- Audio transcription


