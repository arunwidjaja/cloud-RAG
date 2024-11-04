from imports import *

# Local Modules
import config
import prompt_templates
from utils import timer

# Flow of data in LLM summarization:

# 0.  Split corpus of documents into manageable chunks.
# 1.  Input chunked data to MapReduceDocumentsChain.

#     1a. Each chunk is summarized.
#         The summarization prompt is defined by map_template.

# 2.  The chunked and summarized data is combined ("reduced") into one document.
#     2a. The combining prompt is defined by reduce_template.
#     2b. Step #2a is done iteratively if the combined data still exceeds the token maximum.
# 3.  Once under the token maximum, the data is reduced to a final summary.

# tl;dr:

# corpus -> chunks -> chunk summaries -> reduce -> ... -> reduce -> final summary

map_template = prompt_templates.PT_MAP_EVENT_INTERVIEWS_SENTIMENT
reduce_template = prompt_templates.PT_REDUCE_SENTIMENT
model = ChatOpenAI()


@timer
def summarize_map_reduce(db: Chroma, doc_list: List, identifier='hash', preset='general') -> str:
    """
    Retrieves the specified documents' chunks from the DB and summarizes them with map-reduce.
    By default, accepts a list of file hashes.

    Args:
        db:
            The Chroma DB instance containing the files.
        doc_list:
            The list of document file names or hashes.
        identifier:
            Specifies whether the 'docs' argument contains file names or hashes.
            Defaults to 'hash'. Can be 'file_name'.
        preset:
            The preset to run. Defaults to 'General'.
            Presets will have different prompt templates that emphasize different outputs.

    Returns:
        The summary string.
    """
    if isinstance(doc_list, str):
        doc_list = [doc_list]

    templates_preset = prompt_templates.PT_PRESETS[preset.upper()]

    map_template = templates_preset[0]
    map_prompt = ChatPromptTemplate.from_template(map_template)

    reduce_template = templates_preset[1]
    reduce_prompt = ChatPromptTemplate.from_template(reduce_template)

    # Extracts chunks from DB.
    # Converts them to Document objects and stores them.
    # .invoke() requires Documents, not raw text.
    documents = []
    for doc_hash in doc_list:
        matching_chunks = db.get(where={'source_hash': doc_hash})

        for i in range(len(matching_chunks['ids'])):
            document = Document(
                page_content=matching_chunks['documents'][i],
                metadata=matching_chunks['metadatas'][i]
            )
            documents.append(document)

    map_chain = LLMChain(
        llm=model,
        prompt=map_prompt)
    reduce_chain = LLMChain(
        llm=model,
        prompt=reduce_prompt)
    combine_documents_chain = StuffDocumentsChain(
        llm_chain=reduce_chain,
        document_variable_name='docs'
    )
    reduce_documents_chain = ReduceDocumentsChain(
        combine_documents_chain=combine_documents_chain,
        collapse_documents_chain=combine_documents_chain,
        token_max=config.TOKEN_LIMIT
    )
    map_reduce_chain = MapReduceDocumentsChain(
        llm_chain=map_chain,
        reduce_documents_chain=reduce_documents_chain,
        document_variable_name='docs',
        return_intermediate_steps=True
    )

    summary = map_reduce_chain.invoke(documents)

    # Storing these two just in case
    summary_sources = summary['input_documents']
    summary_intermediate = summary['intermediate_steps']

    summary_final = summary['output_text']

    return summary_final
