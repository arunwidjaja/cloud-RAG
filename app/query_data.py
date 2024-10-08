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
from get_embedding_function import get_embedding_function

openai.api_key = config.OPENAI_API_KEY

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""


def build_response_string(response_with_context: Tuple[str, List[Tuple[str, any]]]):
    """
    Format the final text output
    """
    response_string = f"{response_with_context[0]}\n"

    # iterate through each context and append the text and file name to the response string
    for i in range(len(response_with_context[1])):
        context_current = response_with_context[1][i]
        context_text = context_current[0]
        file_name = context_current[1].split('\\')[-1]
        context_summary = f"Source #{
            i + 1}: {file_name}\n...{context_text}...\n"
        response_string = "\n".join([response_string, context_summary])
    return response_string


def query_rag(query_text: str) -> Tuple[str, List[Tuple[str, any]]]:
    """
    Returns a Tuple containing the LLM response and the relevant context.
    The LLM response is a string.
    The relevant context is a List of Tuple, each with the actual text and the file path.
    """
    model = ChatOpenAI()
    embedding_function = get_embedding_function("openai")
    LLM_response = "Unable to find matching results."
    context = []

    # Load the Chroma DB
    # IMPORTANT: CHANGE config.PATH_CHROMA to config.PATH_CHROMA_TMP FOR AWS LAMBDA
    try:
        db = Chroma(persist_directory=str(config.PATH_CHROMA),
                    embedding_function=embedding_function)
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise

    # Retrieve relevant docs and their context from the DB.
    # Quit if no relevant docs found.
    retrieved_docs = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        print(LLM_response)
        return (LLM_response, context)

    # Scrape relevant context and source files
    for doc in retrieved_docs:
        context_current = (doc[0].page_content, doc[0].metadata['source'])
        context.append(context_current)

    # Assemble the prompt to include the context from the relevant docs.
    context_text = "\n\n---\n\n".join(context_current[0]
                                      for context_current in context)
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # model = Ollama(model="mistral")
    LLM_response = model.invoke(prompt)

    # Build and print message
    response_with_context = (LLM_response.content, context)
    message = build_response_string(response_with_context)
    print(message)


def main():
    # Create CLI.
    # parser = argparse.ArgumentParser()
    # parser.add_argument("query_text", type=str, help="The query text.")
    # args = parser.parse_args()
    # query_text = args.query_text
    # query_rag(query_text)

    # Test query
    # Q: How much outdoor ventilation must be provided?
    # A: Based on the given context, the total outdoor ventilation required for both the office and classroom spaces, if served by separate systems, would be 150 cfm + 750 cfm = 900 cfm.
    query_rag("DEEZ NUTZ?!")


if __name__ == "__main__":
    main()
