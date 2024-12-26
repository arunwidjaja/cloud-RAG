from imports import *


class ProcessingStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentProcessor:
    def __init__(self):
        self.processing_status: Dict[str, ProcessingStatus] = {}
        self.processing_lock = asyncio.Lock()

    async def process_document(self, doc_id: str, file_content: bytes):
        """
        Process a single document.
        """
        try:
            self.processing_status[doc_id] = ProcessingStatus.PROCESSING

            # Simulate document processing - replace with your actual processing logic
            await asyncio.sleep(5)

            # Update status to completed
            self.processing_status[doc_id] = ProcessingStatus.COMPLETED

        except Exception as e:
            self.processing_status[doc_id] = ProcessingStatus.FAILED
            raise e

    async def wait_for_completion(self, doc_ids: List[str], timeout: float = 30.0) -> bool:
        """
        Wait for the completion of multiple documents' processing.
        Returns True if all documents completed successfully, False if timeout occurred.
        """
        start_time = datetime.now()

        while True:
            # Check if we've exceeded the timeout
            if (datetime.now() - start_time).total_seconds() > timeout:
                return False

            # Check if all documents are completed
            all_completed = True
            for doc_id in doc_ids:
                status = self.processing_status.get(doc_id)
                if status == ProcessingStatus.FAILED:
                    raise HTTPException(status_code=500,
                                        detail=f"Processing failed for document {doc_id}")
                if status != ProcessingStatus.COMPLETED:
                    all_completed = False
                    break

            if all_completed:
                return True

            # Wait a bit before checking again
            await asyncio.sleep(0.5)
