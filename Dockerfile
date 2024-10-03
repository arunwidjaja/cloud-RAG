# Use the official Python image from the Docker Hub
# FROM python:3.12
FROM public.ecr.aws/lambda/python:3.12

# Setting environment variables
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# Set the working directory in the container
# WORKDIR /app

# Copy the folder containing the app into AWS Lambda's root directory
COPY requirements.txt ${LAMBDA_TASK_ROOT}
COPY app/. ${LAMBDA_TASK_ROOT}

# Install the dependencies
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Command to run the FastAPI app with Uvicorn
# "app" in "api_handler:app" is the instance of the FastAPI class created in api_handler
# CMD ["uvicorn", "api_handler:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Command to run the FastAPI app with Lambda runtime interface
# "handler" in api_handler.handler is the instance of the Mangum handler created in api_handler
CMD ["api_handler.handler"]

# Expose the port the app runs on
EXPOSE 8000