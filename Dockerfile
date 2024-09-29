# Use the official Python image from the Docker Hub
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code into the container
COPY api_handler.py .

# Command to run the FastAPI app with Uvicorn
CMD ["uvicorn", "api_handler:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Expose the port the app runs on
EXPOSE 8000
