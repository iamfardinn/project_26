# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Prevent python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (needed for certain libraries if applicable)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies (optimise PyTorch for CPU to keep the image lightweight)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.3.0 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code, model weights, and processed datasets
COPY src/ ./src/
COPY data/processed/ ./data/processed/
COPY models/ ./models/

# Expose port
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
