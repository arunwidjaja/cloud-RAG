# Use the official Python image from the Docker Hub
FROM python:3.12

# Setting environment variables
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}


# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt


# Copy the application code into the container
# This includes the fastAPI handler, api_handler.py
COPY app/ .

# Command to run the FastAPI app with Uvicorn
CMD ["uvicorn", "api_handler:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Expose the port the app runs on
EXPOSE 8000