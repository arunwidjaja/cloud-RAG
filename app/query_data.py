# External packages
from typing import List, Tuple
import argparse
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import openai
from typing import Tuple, Dict, List
from dataclasses import dataclass, field

# Modules
import config
import prompt_templates
import initialize_chroma_db
import utils

openai.api_key = config.OPENAI_API_KEY


class QueryReponse:
    """
    Contains message, id, and a list of context: source
    """

    message: str
    id: str
    contexts: List[Dict[str, str]]

    def __init__(self, message_arg: str, id_arg: str, contexts_arg: List[Dict[str, str]]):
        self.message = message_arg
        self.id = id_arg
        self.contexts = contexts_arg


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
    prompt = prompt_template.format(
        context=context_text, question=query_text)
    return (prompt)


def query_rag(db:
              Chroma, query_text: str) -> QueryReponse:
    """
    Query LLM, return response and context
    """
    print(f"query_rag has been called with the query: {query_text}")
    print("documents in DB: ")
    print(utils.get_db_file_names(db))

    model = ChatOpenAI()
    prompt_template = prompt_templates.PROMPT_TEMPLATE

    retrieved_docs = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)

    # Query LLM with context and get response
    contexts = []
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        LLM_message = "Unable to find matching results."
        LLM_message_id = config.DEFAULT_MESSAGE_ID
        context = dict.fromkeys(['context', 'source'], None)
    else:
        for doc in retrieved_docs:
            context = dict.fromkeys(['context', 'source'], None)
            source = doc[0].metadata['source']
            source = utils.extract_file_name(source)
            context['context'] = doc[0].page_content
            context['source'] = source

            contexts.append(context)
            context_values = [data['context'] for data in contexts]

    # Build prompt and invoke LLM
    prompt = build_prompt(query_text, context_values, prompt_template)
    LLM_base_response = model.invoke(prompt)

    LLM_message = LLM_base_response.content
    LLM_message_id = LLM_base_response.id

    query_response = QueryReponse(
        message_arg=LLM_message, id_arg=LLM_message_id, contexts_arg=contexts)

    print(query_response)
    return (query_response)


def main():
    return


if __name__ == "__main__":
    main()
