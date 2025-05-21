# Build stage
FROM python:3.10-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies into a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies - use pip compile to minimize dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.10-slim

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy only necessary application files
COPY app.py .
COPY evaluate_model.py .
COPY save_metrics.py .

# Make sure the models directory exists
RUN mkdir -p models

# Set non-sensitive environment variables
ENV API_URL=https://murai-qgd8.onrender.com
ENV MODEL_VERSION=v1.3.0
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV TRANSFORMERS_CACHE=/app/models

# Sensitive environment variables should be passed at runtime
# DO NOT put API keys or secrets in the Dockerfile

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
