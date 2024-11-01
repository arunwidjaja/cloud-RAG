from imports import *

# Local Modules
import config
import utils


def load_documents():
    """
    Loads documents from the data folder
    """
    document_path = utils.get_env_paths()['DOCS']
    documents_list = []

    print(f"Searching for documents in: {document_path}")
    try:
        for file_path in document_path.iterdir():
            print(f"Found file: {file_path.name}")
            if (file_path.suffix in '.txt.md'):
                document = TextLoader(file_path, autodetect_encoding=True)
                documents_list.extend(document.load())
            else:
                print("Invalid format. Skipping this file.")
    except Exception as e:
        raise Exception(f"Exception occured when loading files.")

    return documents_list


def chunk_text(documents: List[Document]) -> List[Document]:
    """
    Splits Documents into chunks
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


def add_chunk_ids(chunks) -> List[Document]:
    """
    Adds IDs to the chunks you're trying to add. Returns a list of Chunks.
    The chunk IDs are formatted as "source:page number:chunk index".
    For example, data/testfile.pdf:5:3 would be the ID for the 3rd chunk of the 5th page of testfile.pdf
    """
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        # "source" is the path of the file
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")

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
        chunk.metadata["id"] = chunk_id
        last_page_id = current_page_id
    return chunks


def add_sentiment(chunks) -> List[Document]:
    """
    Adds sentiment labels to chunks
    """
    sentiment_analyzer = pipeline('sentiment-analysis')
    for chunk in chunks:
        sentiment = sentiment_analyzer(chunk.page_content)[0]
        chunk.metadata['sentiment'] = sentiment['label']
    return chunks


def process_documents() -> List[Document]:
    """
    Runs the document processing pipeline.
    Returns a list of chunks that will be added to the DB.
    """
    documents = load_documents()
    chunks = chunk_text(documents)
    chunks = add_chunk_ids(chunks)
    chunks = add_sentiment(chunks)
    return chunks
