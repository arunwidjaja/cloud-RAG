# External packages
import argparse
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import openai
from typing import Tuple, List

# Modules
import config
import prompt_templates
from get_embedding_function import get_embedding_function
from utils import build_response_string

openai.api_key = config.OPENAI_API_KEY

# PROMPT_TEMPLATE = """
# Answer the question based only on the following context:

# {context}

# ---

# Answer the question based on the above context: {question}
# """


def build_prompt(query_text: str, context: List, prompt_template: str) -> str:
    """
    Builds a prompt from given query, context, and prompt template.
    Context is a list of Tuples, each containing the context string and the source file.
    Query is a string. Prompt Template is an f-string.
    """

    # Assemble the prompt to include the context from the relevant docs.
    context_text = "\n\n---\n\n".join(context_current[0]
                                      for context_current in context)
    prompt_template = ChatPromptTemplate.from_template(prompt_template)
    prompt = prompt_template.format(context=context_text, question=query_text)
    return (prompt)


def query_rag(query_text: str) -> Tuple[str, List[Tuple[str, any]]]:
    """
    Query LLM, return formatted response
    TODO: Add options for different LLMs. Right now only usable with OpenAI
    """
    # model = Ollama(model="mistral")
    model = ChatOpenAI()
    embedding_function = get_embedding_function("openai")

    # Load the Chroma DB
    # IMPORTANT: CHANGE config.PATH_CHROMA to config.PATH_CHROMA_TMP FOR AWS LAMBDA
    try:
        db = Chroma(persist_directory=str(config.PATH_CHROMA_TMP),
                    embedding_function=embedding_function)
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise

    # Retrieve relevant context and their sources from the DB
    context = []
    retrieved_docs = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)
    # Return if nothing sufficiently relevant is found
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        LLM_response = "Unable to find matching results."
        return (LLM_response, context)
    # Store relevant context text and associated source file names
    else:
        for doc in retrieved_docs:
            context_current = (doc[0].page_content, doc[0].metadata['source'])
            context.append(context_current)

    # Build prompt, invoke LLM, and retrieve response
    prompt = build_prompt(query_text, context,
                          prompt_templates.PROMPT_TEMPLATE)
    LLM_response = model.invoke(prompt)
    response_with_context = (LLM_response.content, context)

    # Format and return message
    message = build_response_string(response_with_context)
    print(message)
    return (message)


def main():
    # Create CLI.
    # parser = argparse.ArgumentParser()
    # parser.add_argument("query_text", type=str, help="The query text.")
    # args = parser.parse_args()
    # query_text = args.query_text
    # query_rag(query_text)

    # Test query
    query_rag("What is a guard station?")


if __name__ == "__main__":
    main()
