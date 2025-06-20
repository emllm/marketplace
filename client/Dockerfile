# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Set environment variables
ENV PYTHONDUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.7.1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pip and poetry
RUN pip install --upgrade pip && \
    pip install "poetry==$POETRY_VERSION"

# Copy only requirements first to leverage Docker cache
COPY ./requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Make port available to the world outside this container
EXPOSE 8080

# Run the application
CMD ["python", "agent.py"]
