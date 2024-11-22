from concurrent.futures import ThreadPoolExecutor
from typing import List
import asyncio
from langchain.chat_models import ChatOpenAI
from langchain.docstore.document import Document
from langchain.chains import LLMChain, StuffDocumentsChain, ReduceDocumentsChain, MapReduceDocumentsChain
from langchain.prompts import ChatPromptTemplate

# make sure that token limit * semaphore max concurrency is lower than the openai token limit, which is 8000


async def process_chunk_async(map_chain, chunk):
    """Process a single chunk asynchronously"""
    return await map_chain.ainvoke({"docs": [chunk]})


async def map_chunks_parallel(map_chain, chunks, max_concurrency=5):
    """Process chunks in parallel with controlled concurrency"""
    semaphore = asyncio.Semaphore(max_concurrency)

    async def process_with_semaphore(chunk):
        async with semaphore:
            return await process_chunk_async(map_chain, chunk)

    tasks = [process_with_semaphore(chunk) for chunk in chunks]
    return await asyncio.gather(*tasks)


@timer
async def summarize_map_reduce_async(db: Chroma, doc_list: List, identifier='hash', preset='general') -> str:
    """
    Optimized async version of the map-reduce summarization function.
    """
    if isinstance(doc_list, str):
        doc_list = [doc_list]

    # Initialize model with higher temperature for more diverse summaries
    model = ChatOpenAI(
        temperature=0.3,  # Slight randomness for better summaries
        request_timeout=60,  # Increased timeout
        max_retries=3  # Add retries for reliability
    )

    templates_preset = prompt_templates.PT_PRESETS[preset.upper()]
    map_template, reduce_template = templates_preset

    # Initialize chains
    map_prompt = ChatPromptTemplate.from_template(map_template)
    reduce_prompt = ChatPromptTemplate.from_template(reduce_template)

    map_chain = LLMChain(llm=model, prompt=map_prompt)
    reduce_chain = LLMChain(llm=model, prompt=reduce_prompt)

    # Batch document retrieval
    documents = []
    batch_size = 50  # Adjust based on your needs

    for doc_hash in doc_list:
        # Use batch processing for document retrieval
        for i in range(0, len(doc_list), batch_size):
            batch = doc_list[i:i + batch_size]
            matching_chunks = db.get(where={'source_hash': {'$in': batch}})

            documents.extend([
                Document(
                    page_content=chunk,
                    metadata=metadata
                )
                for chunk, metadata in zip(
                    matching_chunks['documents'],
                    matching_chunks['metadatas']
                )
            ])

    # Process chunks in parallel
    chunk_summaries = await map_chunks_parallel(map_chain, documents)

    # Create intermediate documents from summaries
    intermediate_docs = [
        Document(page_content=summary['output_text'])
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

    # Final reduction
    final_summary = await reduce_documents_chain.ainvoke({"docs": intermediate_docs})

    return final_summary['output_text']

# Helper function to run the async function


def summarize_map_reduce(db: Chroma, doc_list: List, identifier='hash', preset='general') -> str:
    """Wrapper to run the async function"""
    return asyncio.run(summarize_map_reduce_async(db, doc_list, identifier, preset))
