import argparse
# from dataclasses import dataclass
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from get_embedding_function import get_embedding_function

from dotenv import load_dotenv
import openai
import os

# Load environment variables. Assumes that project contains .env file with API keys
load_dotenv()
# ---- Set OpenAI API key
# Change environment variable name from "OPENAI_API_KEY" to the name given in
# your .env file.
openai.api_key = os.environ['OPENAI_API_KEY']

CHROMA_PATH = "chroma"
PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

LLM_K = 5  # default k value


def main():
    # Create CLI.
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)


if __name__ == "__main__":
    main()


def query_rag(query_text: str, mute=False):
    """
    Set mute to True if you don't want to print the output
    """
    # Prepare the DB.
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH,
                embedding_function=embedding_function)

    # Retrieve relevant documents from the DB.
    results = db.similarity_search_with_relevance_scores(query_text, k=LLM_K)
    if len(results) == 0 or results[0][1] < 0.7:
        if not mute:
            print(f"Unable to find matching results.")
        return

    # Assemble the prompt using the relevant documents as context.
    context_text = "\n\n---\n\n".join(
        [doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    # print(prompt)

    # Prompt the LLM
    model = ChatOpenAI()
    # model = Ollama(model="mistral")
    response_text = model.invoke(prompt)
    sources = ([doc.metadata.get("source", None) for doc, _score in results])

    if not mute:
        print(f"Answer:\n{response_text.content}")
        print(f"Sources:\n{"\n".join(sources)}")
    return response_text
