# External Modules
from datetime import datetime
from fastapi import HTTPException
from starlette.requests import Request
from typing import Dict, List

import asyncio

# Local Modules
from custom_types import ProcessingStatus
from database_manager import DatabaseManager
from database_operations import push_db_2
import utils


class DocumentHandler:
    def __init__(self):
        self.processing_status: Dict[str, ProcessingStatus] = {}
        self.processing_lock = asyncio.Lock()

    async def process_document(
        self,
        dbm: DatabaseManager,
        collection: str,
        file_path: str,
        file_id: str
    ) -> str:
        """
        Process a single document.

        Args:
            doc_id: A temporary ID only used to track the document during a single session.
        """
        try:
            self.processing_status[file_id] = ProcessingStatus.PROCESSING
            await push_db_2(dbm, collection, file_path)

            # Update status to completed
            self.processing_status[file_id] = ProcessingStatus.COMPLETED
            return utils.extract_file_name(file_path)

        except Exception as e:
            self.processing_status[file_id] = ProcessingStatus.FAILED
            raise e

    async def wait_for_completion(self, doc_ids: List[str], timeout: float = 300.0) -> bool:
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


async def get_document_handler(request: Request) -> DocumentHandler:
    doc_handler: DocumentHandler = request.app.state.doc_handler
    return doc_handler
