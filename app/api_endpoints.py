from imports import *

# Local Modules
import doc_ops_utils

router = APIRouter()


@router.get("/uploads_metadata")
async def get_uploads_metadata():
    """
    Gets the metadata of all uploads
    """
    print("API CALL: get_uploads_metadata")
    try:
        uploads_metadata = doc_ops_utils.get_uploads_metadata()
        return JSONResponse(content=uploads_metadata)
    except Exception as e:
        raise Exception(f"Exception occured when getting uploads list: {e}")
