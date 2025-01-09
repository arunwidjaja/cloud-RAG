# Use Python 3.12.6 slim image as base
FROM python:3.12.6-slim

# Set working directory
WORKDIR /backend

ARG OPENAI_API_KEY

ARG PASSWORD_SMTP

ARG HOST_DB_AUTH_RDS
ARG USERNAME_DB_AUTH
ARG PASSWORD_DB_AUTH

ARG HOST_DB_MAIN_RDS
ARG USERNAME_DB_MAIN
ARG PASSWORD_DB_MAIN

ENV OPENAI_API_KEY=$OPENAI_API_KEY

ENV PASSWORD_SMTP=$PASSWORD_SMTP

ENV HOST_DB_AUTH_RDS=$HOST_DB_AUTH_RDS
ENV USERNAME_DB_AUTH=$USERNAME_DB_AUTH
ENV PASSWORD_DB_AUTH=$PASSWORD_DB_AUTH

ENV HOST_DB_MAIN_RDS=$HOST_DB_MAIN_RDS
ENV USERNAME_DB_MAIN=$USERNAME_DB_MAIN
ENV PASSWORD_DB_MAIN=$PASSWORD_DB_MAIN



# Install system dependencies required for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire backend application first
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r app/requirements.txt

# Set Python path to include the app directory for local imports
ENV PYTHONPATH=/backend/app

# Change to app directory
WORKDIR /backend/app

# debug commands to check that the imports succeed
RUN python -c "import sys; print('Python path:', sys.path); import config; print('Successfully imported config')"

EXPOSE 8000

# Add the command to run your FastAPI application
CMD ["uvicorn", "application:application", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--log-level", "debug"]