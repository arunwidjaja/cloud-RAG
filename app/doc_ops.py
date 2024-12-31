# External Modules
from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import Pipeline, pipeline  # type: ignore
from typing import Any, List

# Local Modules
from doc_ops_utils import get_token_count
from paths import get_paths

import config
import utils


# See document_structure.notes for an explanation of the structure of a Document object
# Chunks have the same structure as Documents, since they are Documents themselves

# Pipeline for processing documents:
# 1. Load documents: retrieve list of documents in the uploads folder
# 2. Chunk documents: split documents into chunks
# 3. Add metadatas: add metadata tags to the chunks for easier identification

def set_chunk_metadata(chunk: Document, key: str, value: str | Any) -> None:
    metadata: dict[str, Any] = getattr(chunk, "metadata")
    metadata[key] = value
    setattr(chunk, "metadata", metadata)


async def load_documents() -> List[Document]:
    """
    Loads documents from the uploads folder
    """
    document_path = get_paths().UPLOADS
    documents_list: List[Document] = []

    print(f"Searching for documents in: {document_path}")
    try:
        for file_path in document_path.iterdir():
            print(f"Found file: {file_path.name}")
            if (file_path.suffix in '.pdf.PDF'):
                loader = PyPDFLoader(str(file_path))
                async for page in loader.alazy_load():
                    documents_list.append(page)
            else:
                print("Invalid format. Skipping this file.")
    except Exception as e:
        raise Exception(f"Exception occured when loading files: {e}")

    return documents_list


def chunk_text(documents: List[Document]) -> List[Document]:
    """
    Splits documents into chunks
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        length_function=len,
        add_start_index=True,
        is_separator_regex=False
    )
    print(f"Splitting documents...")
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")

    return chunks


def add_user_ids(chunks: List[Document], user_id: str) -> None:
    """
    Modifies chunks.

    Adds the user's ID to the chunk.

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    for chunk in chunks:
        set_chunk_metadata(chunk, "user", user_id)


def add_chunk_ids(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Adds IDs to metadata.
    The chunk IDs are formatted as "file_name:page_number:chunk_index".
    For example, testfile.pdf:5:3 would be the ID for the 3rd chunk of the 5th page of testfile.pdf

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        # "source" is the path of the file
        source_path: str = getattr(chunk, 'metadata')['source']
        source = utils.extract_file_name(source_path)

        page = getattr(chunk, 'metadata')['page']

        # if the chunk ID is the same as the last one, increment the index
        current_page_id = f"{source}:{page}"
        if current_page_id == last_page_id:
            current_chunk_index = current_chunk_index + 1
        else:
            current_chunk_index = 0

        if page is None:
            page = 0
        # create the chunk id
        # the chunk id is formatted as "{source}:{page number}:{chunk index}"
        chunk_id = f"{source}:{page}:{current_chunk_index}"

        set_chunk_metadata(chunk, "id", chunk_id)
        last_page_id = current_page_id


def add_token_count(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Adds the token count to the metadata of the chunks.

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """

    for chunk in chunks:
        token_count = get_token_count(chunk.page_content)
        set_chunk_metadata(chunk, "tokens", token_count)


def add_source_hash(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Adds the hash of the source file to metadata

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    hashes: dict[str, str] = {}
    for chunk in chunks:
        source: str = getattr(chunk, "metadata")['source']
        if source not in hashes:
            hashes[source] = utils.get_hash(source)
        set_chunk_metadata(chunk, 'source_hash', hashes[source])


def add_source_base_name(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Adds source file name to metadata. (Name only, no path.)

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    for chunk in chunks:
        source_base_name = utils.extract_file_name(
            getattr(chunk, "metadata")['source'])
        set_chunk_metadata(chunk, "source_base_name", source_base_name)


def add_word_count(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Adds the word count to metadata.

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    for chunk in chunks:
        word_count = len(chunk.page_content.split())
        set_chunk_metadata(chunk, "word_count", word_count)


def add_sentiment(chunks: List[Document]) -> None:
    """
    Modifies chunks.

    Performs sentiment analysis and adds sentiment labels and scores to chunks.

    Currently using default model for simple POSITIVE/NEGATIVE classification with a score.

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """
    sentiment_analyzer: Pipeline = pipeline(
        task='sentiment-analysis',
        model=config.SENTIMENT_ANALYSIS_MODEL_DEFAULT
    )

    for chunk in chunks:
        chunk_content: str = getattr(chunk, "page_content")

        # Sentiment_analyzer outputs a list of dictionaries for the task 'sentiment-analysis'
        # Each dictionary contains the label and score.
        # Since only one text is passed in at a time, it is a list of 1.
        sentiment_output: Any = sentiment_analyzer(chunk_content)

        sentiment = sentiment_output[0]  # The only list item
        sentiment_label: str = sentiment['label']
        sentiment_score: float = sentiment['score']

        set_chunk_metadata(chunk, "sentiment", sentiment_label)
        set_chunk_metadata(chunk, "sentiment_score", sentiment_score)


def add_collection(chunks: List[Document], collection: str) -> None:
    """
    Modifies chunks

    Adds the collection name to the chunk.
    This makes it easier to reference the collection name later.

    Args:
        chunks: A list of chunks, which are Document objects, to be modified.
    """

    for chunk in chunks:
        set_chunk_metadata(chunk, "collection", collection)


async def process_documents(collection: str, user_id: str) -> List[Document]:
    """
    Runs the document processing pipeline.
    Returns a list of chunks that will be added to the DB.

    Args:
        collection: The collection that the documents will be added to.
    """
    documents = await load_documents()
    chunks = chunk_text(documents)
    add_user_ids(chunks, user_id)
    add_token_count(chunks)
    add_chunk_ids(chunks)
    add_source_hash(chunks)
    add_source_base_name(chunks)
    add_word_count(chunks)
    add_sentiment(chunks)
    add_collection(chunks, collection)
    return chunks


def main():
    get_token_count("This is a test string to test the tokenizer function")


if __name__ == "__main__":
    main()
