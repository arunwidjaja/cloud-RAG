# Use the official Python image from the Docker Hub
# FROM python:3.12
FROM public.ecr.aws/lambda/python:3.12

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

# Install AWS Lambda Runtime Interface Client (RIC) for FastAPI integration
RUN pip install awslambdaric

# Command to run the FastAPI app with Uvicorn
# "app" in "api_handler:app" is the instance of the FastAPI class created in api_handler
# CMD ["uvicorn", "api_handler:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Command to run the FastAPI app with Lambda runtime interface
# "handler" in api_handler.handler is the instance of the Mangum handler created in api_handler
CMD ["api_handler.handler"]


# Expose the port the app runs on
EXPOSE 8000