# RAGBase

RAGbase is a Retrieval-Augmented Generation dashboard that allows users to query a database of assorted file types via a chat-style web interface. It can also generate document summaries, as well as sentiment and theme analyses.
Text transformation, embedding, and generation is currently powered primarily by OpenAI's CLIP, ADA, and GPT-4.

## Getting Started

RAGbase is available as a free cloud service [here.](https://www.ragbase.cloud)

It can also be compiled and run locally, but requires OpenAI API keys:

1. Update <code>/app/config.py</code> with your local file and environment paths.

2. Update <code>/.env</code> and add your <code>OPENAI_API_KEY</code> key.

3. LLM performance can be tweaked by configuring parameters in <code>/app/config.py</code> and templates in <code>/app/prompt_templates.py</code>


## Technical Stack

| Frontend | [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#) [![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#) [![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#) |
|:----------:|:-------------|
| **Backend** | [![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#) [![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?logo=huggingface&logoColor=000)](#) [![FastAPI](https://img.shields.io/badge/FastAPI-009485.svg?logo=fastapi&logoColor=white)](#) [![GraphQL](https://img.shields.io/badge/GraphQL-E10098.svg?logo=graphql&logoColor=white)](#)|
| **Database** | [![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#) [![RDS](https://img.shields.io/badge/RDS-527FFF.svg?logo=amazonrds&logoColor=white)](#)||
| **DevOps** | [![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](#) [![S3](https://img.shields.io/badge/S3-569A31.svg?logo=amazons3&logoColor=white)](#) [![EC2](https://img.shields.io/badge/EC2-FF9900.svg?logo=amazonec2&logoColor=white)](#) 

## Announcements

### 2025.01.15

RAGbase has officially joined AWS Startups! The Founders program will provide funding for service usage across all AWS platforms.

Hardware and cost limitations are one of the biggest obstacles in deploying new capabilities.

Several exciting features in the development pipeline that will greatly benefit from this partnership include image embedding, document annotation, and migration of user data to a NoSQL platform for greater flexibility.

Keep an eye out for RAGbase on Startup Showcase! The page will be launching soon.


## Release Notes

<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/assets/readme/screenshot.PNG" />
<img src="https://github.com/arunwidjaja/cloud-RAG/blob/main/assets/readme/v0.6.PNG" />

### 2025.01.03 - v0.6
- Migration from ChromaDB -> PostgreSQL + pgvector
- Hosting now on RDS
- Client enhancments
  - Attachments, chat editing 
- User account enhancements
  - Chat exports, account deletion  
- PDF support

Happy 2025! 🎉 New year, New Database:

December has been busy and RAGbase has undergone some restructuring.
While ChromaDB has been excellent for early prototyping, RAGbase has moved to PostgreSQL, primarily for native AWS RDS support.
PostgreSQL also offers support for rich metadata (JSON) and more flexibility with direct DB manipulation via queries.
Backend now runs on a Docker EC2 platform for smoother deployments going forward.

### 2024.12.05 - v0.5
- cloud-RAG has a new home and a new name: RAGbase!
    - Deployed to: [ragbase.cloud](https://www.ragbase.cloud/landing)
- Migrated to AWS:
    - Amplify Frontend, EB/EC2 Backend 
- Support for multiple users
  - Registrations are available on request to limit traffic 
- Support for chat history

### 2024.11.21 - v0.4
- UI overhaul
  - Theme switcher
  - Tab panel for RAG, database, and uploads
  - Navbar and sidebar
- Migration to TypeScript, Tailwind CSS, and Vite

### 2024.11.13 - v0.3
- Migration to React.JS

### 2024.11.04 - v0.2
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
