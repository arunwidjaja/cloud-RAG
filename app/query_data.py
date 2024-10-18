# External packages
from typing import List, Tuple
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
import initialize_chroma_db
import utils

openai.api_key = config.OPENAI_API_KEY


class ResponseContext(List[Tuple[str, str]]):
    """
    List of Tuples. Tuples are a pair of values.
    First value is the context text, second value is the file it came from.
    """

    def __init__(self):
        super().__init__()  # Call the constructor of the parent class (list)

    def add(self, context: str, source: str):
        # Append the tuple (first, second) to the list
        self.append((context, source))


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


def query_rag(db: Chroma, query_text: str) -> str:
    """
    Query LLM, return response and context
    TODO: Add options for different LLMs. Right now only usable with OpenAI
    """
    print(f"query_rag has been called with the query: {query_text}")
    model = ChatOpenAI()
    print(config.PATH_CHROMA_LOCAL)
    print("documents in DB: ")
    print(utils.get_db_file_names(db))

    # Search DB for relevant context
    context = ResponseContext()
    retrieved_docs = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)

    # Query LLM with context and get response
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        LLM_response = "Unable to find matching results."
    else:
        for doc in retrieved_docs:
            context.add(doc[0].page_content, doc[0].metadata['source'])
        # Build prompt, invoke LLM, and retrieve response
        prompt = build_prompt(query_text, context,
                              prompt_templates.PROMPT_TEMPLATE)
        LLM_response = model.invoke(prompt)

    # Build output message
    message = utils.build_response_string(LLM_response.content, context)
    print(message)
    return (message)


def main():
    return


if __name__ == "__main__":
    main()
