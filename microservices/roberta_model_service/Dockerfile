FROM python:3.10-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TRANSFORMERS_CACHE=/app/models
# Disable CUDA/GPU
ENV CUDA_VISIBLE_DEVICES=-1
# Optimize CPU threading
ENV OMP_NUM_THREADS=4
# Reduce model loading memory usage
ENV PYTORCH_NO_CUDA_MEMORY_CACHING=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directory for models
RUN mkdir -p /app/models/roberta-tagalog-profanity

# Copy application code
COPY app.py .

# Copy the model files
COPY ./models/roberta-tagalog-profanity/* /app/models/roberta-tagalog-profanity/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
