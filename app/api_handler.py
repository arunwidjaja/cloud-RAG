# External packages
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from starlette.requests import Request
from pydantic import BaseModel
from mangum import Mangum  # AWS Lambda handler

# Modules
from query_data import query_rag
import config

# Initialize FastAPI handler and Mangum handler
app = FastAPI()
handler = Mangum(app)

# Mount HTML/CSS
app.mount("/static", StaticFiles(directory=config.PATH_STATIC), name="static")
templates = Jinja2Templates(directory=config.PATH_TEMPLATES)


class Query(BaseModel):
    query_text: str

# GETS


@app.get("/")
async def read_root(request: Request):
    # Render the index.html from the templates folder
    return templates.TemplateResponse("index.html", {"request": request})


# POSTS


@app.post("/repeat_query")
def repeat_query(request: Query):
    query_text = request.query_text
    return {"Query": {query_text}}


@app.post("/submit_query")
def submit_query(request: Query):
    query_response = query_rag(request.query_text, plainText=True)
    return {"query_Response": query_response}


# Run main to test locally on localhost:8000
if __name__ == "__main__":
    print(f"Running the FastAPI server on port {config.port}.")
    uvicorn.run("api_handler:app", host="0.0.0.0", port=config.port)
