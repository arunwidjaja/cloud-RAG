from imports import *

# Local Modules
import config
import db_ops_utils
import utils
import prompt_templates

openai.api_key = config.OPENAI_API_KEY


class QueryResponse:
    """
    Contains message, id, and a list of dictionaries containing source and context
    """

    message: str
    id: str
    contexts: List[dict]

    def __init__(self, message_arg: str, id_arg: str, contexts_arg: List[dict]):
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
    context_text = "\n\n---\n\n".join(
        context_current for context_current in context)
    prompt_template = ChatPromptTemplate.from_template(prompt_template)
    prompt = prompt_template.format(
        context=context_text, question=query_text)
    return (prompt)


def query_rag(db:
              Chroma, query_text: str) -> QueryResponse:
    """
    Query LLM, return response and context
    """
    model = ChatOpenAI()
    prompt_template = prompt_templates.PT_RAG

    # search for relevant context
    retrieved_docs = db.similarity_search_with_relevance_scores(
        query_text, k=config.LLM_K)

    # aggregate context
    contexts = []
    if len(retrieved_docs) == 0 or retrieved_docs[0][1] < config.RELEVANCE_THRESHOLD:
        LLM_message = "Unable to find matching results."
        LLM_message_id = config.DEFAULT_MESSAGE_ID
        context = dict.fromkeys(['context', 'source', 'hash'], None)
    else:
        for doc in retrieved_docs:
            # store source and context in dictionary
            context = dict.fromkeys(['context', 'source', 'hash'], None)

            doc_source = doc[0].metadata['source_base_name']
            doc_hash = doc[0].metadata['source_hash']
            doc_context = doc[0].page_content

            context['source'] = doc_source
            context['hash'] = doc_hash
            context['context'] = doc_context

            # merge contexts from sources that have already been added
            source_is_duplicate = False
            for entry in contexts:
                hash_existing = entry['hash']
                if hash_existing == doc_hash:
                    entry['context'] = (
                        entry['context'] +
                        '\n...\n' +
                        doc_context
                    )
                    source_is_duplicate = True
                    break

            # append to list of contexts
            if not source_is_duplicate:
                contexts.append(context)

    # Build prompt and invoke LLM
    context_values = [data['context'] for data in contexts]
    prompt = build_prompt(query_text, context_values, prompt_template)

    LLM_base_response = model.invoke(prompt)

    LLM_message = LLM_base_response.content
    LLM_message_id = LLM_base_response.id

    query_response = QueryResponse(
        message_arg=LLM_message, id_arg=LLM_message_id, contexts_arg=contexts)

    print(query_response)
    return (query_response)


def main():
    return


if __name__ == "__main__":
    main()
