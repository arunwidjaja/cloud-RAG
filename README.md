# cloud-RAG

This is a RAG service that allows users to query a database of assorted file types via a web interface. Currently powered by OpenAI's ADA and GPT-3.5 models.

# Getting Started

The web UI is not currently open to the public but you can compile and run the app locally.

# Project Info

Project Stack:
<ul>

  -Python - Main logic
  
  -Langchain - LLM framework
  
  -Chroma - Vector DB
  
  -FastAPI, Docker, Amazon AWS - Deployment and hosting
  
  -HTML, JavaScript - Frontend
  
</ul>


In development:
- migrating to persistent storage on Amazon S3
- adding CLI commands
- display database contents on web UI

Possible features:
- allowing front-end file upload
- adding support for locally hosted GPU-accelerated models (Mistral, LlaMa, etc.)
- Audio transcription


