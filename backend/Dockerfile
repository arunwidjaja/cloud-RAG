# Use Python 3.12.6 slim image as base
FROM python:3.12.6-slim

# Set working directory
WORKDIR /backend

ARG OPENAI_API_KEY
ARG SMTP_PASSWORD
ARG AWS_RDS_ENDPOINT
ARG POSTGRES_USERNAME
ARG POSTGRES_PASSWORD

ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV SMTP_PASSWORD=$SMTP_PASSWORD
ENV AWS_RDS_ENDPOINT=$AWS_RDS_ENDPOINT
ENV POSTGRES_USERNAME=$POSTGRES_USERNAME
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD



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
CMD ["uvicorn", "application:application", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]