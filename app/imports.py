# LangChain
from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.prompts import ChatPromptTemplate
from langchain.prompts import PromptTemplate
from langchain_chroma import Chroma
# from langchain_community.embeddings.bedrock import BedrockEmbeddings
# from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from transformers import pipeline

# OpenAI
import openai

# ChromaDB
import chromadb
import chromadb.config
from chromadb.config import Settings

# API
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, HTTPException, APIRouter, Query, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from mangum import Mangum
from pydantic import BaseModel
from starlette.requests import Request

# General
import asyncio
import bcrypt
import time
import functools
import sqlite3
import boto3
import json
import io
import os
import re
import shutil
import zipfile
import uuid
from collections import Counter, defaultdict
from io import BytesIO
from dotenv import load_dotenv
from pathlib import Path
from pprint import pprint
from typing import Dict, List, Optional, Tuple, Callable, Any
