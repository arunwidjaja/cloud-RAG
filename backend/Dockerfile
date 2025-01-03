# Use Python 3.12.6 slim image as base
FROM python:3.12.6-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY app/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app/ .

# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "application:application", "--host", "0.0.0.0", "--port", "8000"]