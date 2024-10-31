# LangChain
from langchain.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
# from langchain_community.embeddings.bedrock import BedrockEmbeddings
# from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings

# OpenAI
import openai

# ChromaDB
import chromadb
import chromadb.config
from chromadb.config import Settings

# API
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from mangum import Mangum
from pydantic import BaseModel
from starlette.requests import Request

# General
import bcrypt
import boto3
import os
import shutil
from dotenv import load_dotenv
from pathlib import Path
from typing import Dict, List
