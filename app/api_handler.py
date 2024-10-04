# External packages
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from pydantic import BaseModel
from mangum import Mangum  # AWS Lambda handler

# Modules
from query_data import query_rag

app = FastAPI()
handler = Mangum(app)


class SubmitQueryRequest(BaseModel):
    query_text: str


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Display start page
@app.get("/")
async def read_root(request: Request):
    # Render the HTML file (index.html) from the templates folder
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/submit_query")
def submit_query_endpoint(request: SubmitQueryRequest):
    query_response = query_rag(request.query_text, plainText=True)
    return {"response": query_response}


# Main function is only for testing locally
if __name__ == "__main__":
    port = 8000
    print(f"Running the FastAPI server on port {port}.")
    uvicorn.run("api_handler:app", host="0.0.0.0", port=port)
