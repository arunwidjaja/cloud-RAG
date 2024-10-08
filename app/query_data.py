# External packages
import argparse
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import openai

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


def query_rag(query_text: str, mute=False, plainText=False):
    """
    Set mute to True if you don't want to print the output
    set plainText to true to return the answer without metadata
    """
    response_text = "Unable to find matching results."
    # Prepare the DB.
    embedding_function = get_embedding_function()

    try:
        db = Chroma(persist_directory=str(config.PATH_CHROMA_TMP),
                    embedding_function=embedding_function)
    except Exception as e:
        print(f"Error initializing Chroma: {str(e)}")
        raise

    # Retrieve relevant documents from the DB.
    results = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)
    if len(results) == 0 or results[0][1] < 0.7:
        if not mute:
            print(response_text)
        return response_text

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
        print(f"Sources:\n{',\n'.join(sources)}")

    if (not plainText):
        return response_text
    else:
        return response_text.content


def main():
    # Create CLI.
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)


if __name__ == "__main__":
    main()
