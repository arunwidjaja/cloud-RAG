# External Modules
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import ReduceDocumentsChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.prompts import ChatPromptTemplate
from langchain.schema import Document
from typing import List

import asyncio

# Local Modules
from utils import async_timer

import config
import prompt_templates


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


async def process_chunk_async(map_chain: LLMChain, chunk: Document):
    """Process a single chunk asynchronously"""
    return await map_chain.ainvoke({"docs": [chunk]})


async def map_chunks_parallel(map_chain: LLMChain, chunks: List[Document], max_concurrency: int = config.MAX_CONCURRENCY):
    """Process chunks in parallel with controlled concurrency"""
    semaphore = asyncio.Semaphore(max_concurrency)

    async def process_with_semaphore(chunk: Document):
        async with semaphore:
            return await process_chunk_async(map_chain, chunk)

    tasks = [process_with_semaphore(chunk) for chunk in chunks]
    return await asyncio.gather(*tasks)

map_template = prompt_templates.PT_MAP_EVENT_INTERVIEWS_SENTIMENT
reduce_template = prompt_templates.PT_REDUCE_SENTIMENT
model = ChatOpenAI(
    max_retries=3
)


@async_timer
async def summarize_map_reduce(db: Chroma, uuid: str, doc_list: str | List[str], identifier: str = 'hash', preset: str = 'general') -> str:
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

    print(f"Hashes: {doc_list}")

    templates_preset = prompt_templates.PT_PRESETS[preset.upper()]

    map_template = templates_preset[0]
    map_prompt = ChatPromptTemplate.from_template(map_template)

    reduce_template = templates_preset[1]
    reduce_prompt = ChatPromptTemplate.from_template(reduce_template)

    # Extracts chunks from DB.
    # Converts them to Document objects and stores them.
    # .invoke() requires Documents, not raw text.
    documents: List[Document] = []
    for doc_hash in doc_list:
        matching_chunks = db.get(
            where={
                'source_hash': doc_hash,
                'id': uuid
            }
        )

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

    chunk_summaries = await map_chunks_parallel(map_chain, documents)

    intermediate_docs = [
        Document(page_content=summary['text'])
        for summary in chunk_summaries
    ]

    # Reduce step
    combine_documents_chain = StuffDocumentsChain(
        llm_chain=reduce_chain,
        document_variable_name='docs'
    )

    # Optimize token handling
    reduce_documents_chain = ReduceDocumentsChain(
        combine_documents_chain=combine_documents_chain,
        collapse_documents_chain=combine_documents_chain,
        token_max=config.TOKEN_LIMIT
    )

    final_summary = await reduce_documents_chain.ainvoke({"input_documents": intermediate_docs})
    summary_final = final_summary['output_text']

    return summary_final
