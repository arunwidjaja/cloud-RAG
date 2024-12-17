from imports import *

# Local Modules
import config
import db_ops_utils
import utils
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
    contexts: List[dict]

    def __init__(self, message_arg: str, id_arg: str, contexts_arg: List[dict]):
        self.message = message_arg
        self.id = id_arg
        self.contexts = contexts_arg


def get_chat(user_id: str, chat_id: str):
    """
    Retrieves the specified chat.

    Attributes:
        user_id: User ID. 
        chat_id: Chat ID. Messages will be retrieved from the chat matching this ID.

    Returns:
        The chat.
    """
    return


def assemble_query(query: str, chat_messages: str) -> str:
    """
    Assembles a query based on the user's current query and context from the chat history.
    For example, if a user adds clarifying details or builds upon their previous query, this will provide a full query with all details.
    The embeddings are searched based on the full query.

    Attributes:
        query: The user's query
        chat_messages: the messages from the current chat

    Returns:
        The reconstructed chat.
    """
    return


def build_prompt(
    query_text: str,
    context: List[tuple],
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
    context_text = "\n\n---\n\n".join(
        context_current for context_current in context)
    prompt_template = ChatPromptTemplate.from_template(prompt_template)

    prompt = prompt_template.format(
        context=context_text, question=query_text)
    return (prompt)


def query_rag(
    db: Chroma,
    query_text: str,
    query_type: str,
    collections=None
) -> QueryResponse:
    """
    Query LLM, return response and context

    Args:
        db: The Chroma instance
        query_text: The user's query string
        collections: List of collection names include in the search

    Returns:
        QueryResponse
    """
    model = ChatOpenAI()
    if query_type == 'question':
        prompt_template = prompt_templates.PT_RAG
    if query_type == 'statement':
        prompt_template = prompt_templates.PT_RAG_STATEMENT
    if collections is not None:
        coll_list = collections
    else:
        coll_list = db_ops_utils.get_all_collections_names(db)

    # Search all collections and combine the results into one list
    aggregated_docs = []
    for coll_name in coll_list:
        print(f"Searching collection: {coll_name}")
        collection = Chroma(
            client=db._client,
            embedding_function=db._embedding_function,
            collection_name=coll_name
        )
        aggregated_docs_partial = collection.similarity_search_with_relevance_scores(
            query=query_text,
            k=config.LLM_K
        )
        aggregated_docs.extend(aggregated_docs_partial)

    # Sort the retrieved docs based on relevance score and retrieve the top K results
    # Relevance score is the second element of the tuple (doc[1])
    retrieved_docs = sorted(
        aggregated_docs,
        key=lambda doc: doc[1],
        reverse=True
    )
    retrieved_docs = retrieved_docs[:config.LLM_K]

    # aggregate context
    contexts = []
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        LLM_message = "Unable to find matching results."
        LLM_message_id = config.DEFAULT_MESSAGE_ID
        context = dict.fromkeys(['context', 'source', 'source_hash'], None)
    else:
        for doc in retrieved_docs:
            # store source and context in dictionary
            context = dict.fromkeys(['context', 'source', 'source_hash'], None)

            doc_source_hash = doc[0].metadata['source_hash']
            doc_source = doc[0].metadata['source_base_name']
            doc_collection = doc[0].metadata['collection']
            doc_context = doc[0].page_content

            context['source_hash'] = doc_source_hash
            context['source'] = doc_source
            context['collection'] = doc_collection
            context['context'] = doc_context

            # merge contexts from sources that have already been added
            source_is_duplicate = False
            for entry in contexts:
                hash_existing = entry['source_hash']
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

    # Build prompt and invoke LLM
    context_values = [data['context'] for data in contexts]
    prompt = build_prompt(
        query_text=query_text,
        context=context_values,
        prompt_template=prompt_template
    )

    LLM_base_response = model.invoke(prompt)

    LLM_message = LLM_base_response.content
    LLM_message_id = LLM_base_response.id

    query_response = QueryResponse(
        message_arg=LLM_message,
        id_arg=LLM_message_id,
        contexts_arg=contexts
    )

    print(query_response)
    return (query_response)


def main():
    return


if __name__ == "__main__":
    main()
