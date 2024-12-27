# External Modules
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.prompts import ChatPromptTemplate
from langchain.schema import BaseMessage, Document
from typing import AsyncGenerator, Dict, List

import asyncio
import json
import openai

# Local Modules
from api_MODELS import ChatModel

import config
import db_ops_utils
import prompt_templates

openai.api_key = config.OPENAI_API_KEY


class QueryResponse:
    """
    Holds the LLM RAG response

    Attributes:
        message: LLM's answer
        id: message id
        contexts: context dictionary. contains the retrieved context and the source file
    """

    message: str
    id: str
    contexts: List[Dict[str, str]]

    def __init__(self, message_arg: str, id_arg: str, contexts_arg: List[Dict[str, str]]):
        self.message = message_arg
        self.id = id_arg
        self.contexts = contexts_arg


def parse_chat(chat: ChatModel) -> str:
    """
    Parses the ChatModel object into a formatted string, used to prompt the LLM.
    Inputs/Outputs/Context are labeled accordingly.
    This can be used to prompt the LLM to assemble a new query for building the final prompt.
    """

    messages = chat.messages[::-1]  # reversing order of messages
    # Skip parsing and return and empty string if the chat history is empty
    if not messages:
        return ""
    else:
        conversation = "Previous Messages:\n"
        for c_msg in messages:
            conversation = conversation + c_msg.type + ":\n"
            conversation = conversation + c_msg.text + "\n"
        return conversation


def assemble_query(query: str, chat: str) -> str:
    """
    Assembles a query based on the user's current query and message history.
    For example, if a user adds clarifying details or builds upon their previous query, this will provide a full query with all details.
    The embeddings are searched based on the full query.

    The model used for query reconstruction is hardcoded.
    TODO: Switch to a lightweight model for this step. Currently using OpenAI.

    Attributes:
        query: The user's query
        chat_messages: the messages from the current chat

    Returns:
        The original query if chat is empty, else it returns the reconstructed query.
    """
    if not chat:
        return query
    else:
        prompt_template = ChatPromptTemplate.from_template(
            template=prompt_templates.PT_QUERY_RECONSTRUCTION)
        prompt = prompt_template.format(
            context=chat,
            question=query
        )
        message: BaseMessage = ChatOpenAI().invoke(prompt)

        query_reconstructed: str = getattr(message, 'content')
        return query_reconstructed


def build_prompt_RAG(
    query_text: str,
    context: List[str],
    prompt_template: str
) -> str:
    """
    Builds a prompt to feed to the LLM.

    Args:
        query_text: The user's query string
        context: a list of Tuples, each containing the context string and the source file,
        prompt_template: f-string prompt template

    Returns:
        The formatted prompt string
    """
    # Assemble the prompt to include the context from the relevant docs.

    context_text: str = "\n\n---\n\n".join(
        context_current for context_current in context)
    chat_prompt_template: ChatPromptTemplate = ChatPromptTemplate.from_template(
        prompt_template)

    prompt = chat_prompt_template.format(
        context=context_text,
        question=query_text)
    return (prompt)


def search_database(query: str, db: Chroma, collections: List[str]) -> List[tuple[Document, float]]:
    print(f"Searching for documents relevant to the query: {
          query}")
    aggregated_docs: List[tuple[Document, float]] = []
    coll_list = collections
    for coll_name in coll_list:
        print(f"Searching collection: {coll_name}")
        collection = db_ops_utils.get_collection(db, coll_name)
        aggregated_docs_partial = collection.similarity_search_with_relevance_scores(
            query=query,
            k=config.LLM_K
        )
        aggregated_docs.extend(aggregated_docs_partial)

    # Sort the retrieved docs based on relevance score and retrieve the top K results
    # Relevance score is the second element of the tuple (doc[1])
    retrieved_docs: List[tuple[Document, float]] = sorted(
        aggregated_docs,
        key=lambda doc: doc[1],
        reverse=True
    )
    retrieved_docs = retrieved_docs[:config.LLM_K]
    return retrieved_docs


def combine_context(retrieved_docs: List[tuple[Document, float]]) -> List[Dict[str, str]]:
    """
    Consolidates all of the contexts from a list of retrieved Documents.

    Args:
        retrieved_docs: The result of a similarity search. A list of Tuples containing a Document and its score.

    Returns:
        A list of contexts.
        Each context is a dictionary.
        The keys contain information about the context, such as:
        'context', 'source', 'source_hash', etc.
        Keys and Values are both strings.
    """
    contexts: List[Dict[str, str]] = []
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        context = dict.fromkeys(['context', 'source', 'source_hash'], None)
    else:
        for doc in retrieved_docs:
            # store source and context in dictionary
            context = dict.fromkeys(['context', 'source', 'source_hash'], "")

            doc_source_hash: str = getattr(doc[0], 'metadata')['source_hash']
            doc_source: str = getattr(doc[0], 'metadata')['source_base_name']
            doc_collection: str = getattr(doc[0], 'metadata')['collection']
            doc_context: str = doc[0].page_content

            context['source_hash'] = doc_source_hash
            context['source'] = doc_source
            context['collection'] = doc_collection
            context['context'] = doc_context

            # merge contexts from sources that have already been added
            source_is_duplicate = False
            for entry in contexts:
                hash_existing: str = entry['source_hash']
                if hash_existing == doc_source_hash:
                    entry['context'] = (
                        entry['context'] +
                        '...\n\n...' +
                        doc_context
                    )
                    source_is_duplicate = True
                    break

            # append to list of contexts
            if not source_is_duplicate:
                contexts.append(context)
    return contexts


def query_rag(
    db: Chroma,
    query_text: str,
    chat: ChatModel,
    query_type: str,
    collections: List[str] | None
) -> QueryResponse:
    """
    Query LLM, return response and context

    Args:
        db: The Chroma instance
        query_text: The user's query string.
        chat: The messages in the chat prior to the query.
        query_type: this is "question" for now since all queries are by default questions.
        collections: List of collection names include in the search. If None, searches all collections.

    Returns:
        QueryResponse
    """
    chat_parsed = parse_chat(chat)
    query_reconstructed = assemble_query(
        query=query_text,
        chat=chat_parsed
    )
    print("Latest Query:\n" + query_text + "\n")
    print("Reconstructued Query:\n" + query_reconstructed)

    model = ChatOpenAI()
    if query_type == 'statement':
        prompt_template = prompt_templates.PT_RAG_STATEMENT
    else:
        prompt_template = prompt_templates.PT_RAG

    if collections is not None:
        coll_list = collections
    else:
        coll_list = db_ops_utils.get_all_collections_names(db)

    # Search all collections and combine the results into one list
    retrieved_docs = search_database(
        query=query_reconstructed,
        db=db,
        collections=coll_list
    )

    contexts = combine_context(retrieved_docs)

    # Build prompt and invoke LLM
    context_values = [data['context'] for data in contexts]
    prompt = build_prompt_RAG(
        query_text=query_text,
        context=context_values,
        prompt_template=prompt_template
    )
    LLM_base_response = model.invoke(prompt)

    LLM_message: str = getattr(LLM_base_response, 'content')
    LLM_message_id: str = getattr(LLM_base_response, 'id')

    query_response = QueryResponse(
        message_arg=LLM_message,
        id_arg=LLM_message_id,
        contexts_arg=contexts
    )
    return query_response


async def query_rag_streaming(
    db: Chroma,
    query_text: str,
    chat: ChatModel,
    query_type: str,
    collections: List[str] | None = None
) -> AsyncGenerator[str, None]:
    """
    Query LLM, stream response and context

    Args:
        db: The Chroma instance
        query_text: The user's query string.
        chat: The messages in the chat prior to the query.
        query_type: this is "question" for now since all queries are by default questions.
        collections: List of collection names include in the search. If None, searches all collections.

    Returns:
        Text stream of the LLM's response
    """
    chat_parsed = parse_chat(chat)

    query_reconstructed = assemble_query(
        query=query_text,
        chat=chat_parsed
    )

    # Setup streaming callback handler
    callback_handler = AsyncIteratorCallbackHandler()
    model = ChatOpenAI(
        streaming=True,
        callbacks=[callback_handler]
    )

    # Prepare context and prompt
    if collections is not None:
        coll_list = collections
    else:
        coll_list = db_ops_utils.get_all_collections_names(db)

    retrieved_docs = search_database(
        query=query_reconstructed,
        db=db,
        collections=coll_list
    )

    contexts = combine_context(retrieved_docs)
    context_values = [data['context'] for data in contexts]

    prompt_template = (
        prompt_templates.PT_RAG if query_type == 'question'
        else prompt_templates.PT_RAG_STATEMENT
    )

    prompt = build_prompt_RAG(
        query_text=query_text,
        context=context_values,
        prompt_template=prompt_template
    )

    # Create task for streaming response
    task = asyncio.create_task(model.ainvoke(prompt))

    # Stream the response chunks
    async for chunk in callback_handler.aiter():
        yield chunk

    # Wait for completion and get message ID
    llm_response: BaseMessage = await task
    llm_message = getattr(llm_response, 'content')
    llm_message_id = getattr(llm_response, 'id')
    print(f"LLM Response {llm_message_id}:\n{llm_message}")

    # Yield the contexts as a final chunk
    yield "\n\nSources:\n" + "\n".join(
        f"{ctx['source']}"
        for ctx in contexts
    )

    # Yield context metadata
    yield "\n\nMETADATA:" + json.dumps({
        "contexts": contexts
    })


def main():
    return


if __name__ == "__main__":
    main()
