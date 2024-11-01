from imports import *

# Local Modules
import config

openai.api_key = config.OPENAI_API_KEY


def get_embedding_function(embedding: str):
    """
    Specify which LLM's embedding function you want.
    """
    match embedding:
        case "openai":
            embeddings = OpenAIEmbeddings()
        # case "bedrock":
        #     embeddings = BedrockEmbeddings(
        #         credentials_profile_name="default", region_name="us-east-1"
        #     )
        # case "ollama":
        #     embeddings = OllamaEmbeddings(model="nomic-embed-text")
    return embeddings
