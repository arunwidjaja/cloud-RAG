from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.embeddings.bedrock import BedrockEmbeddings
from langchain_openai import OpenAIEmbeddings

import openai
from dotenv import load_dotenv

# Modules
import app.config as config

# load_dotenv()
openai.api_key = config.OPENAI_API_KEY


def get_embedding_function(embedding="openai"):
    """Specify which LLM's embedding function you want."""
    match embedding:
        case "openai":
            embeddings = OpenAIEmbeddings()
        case "bedrock":
            embeddings = BedrockEmbeddings(
                credentials_profile_name="default", region_name="us-east-1"
            )
        case "ollama":
            embeddings = OllamaEmbeddings(model="nomic-embed-text")
    return embeddings
