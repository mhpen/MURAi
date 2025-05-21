# MURAi Microservices

This repository contains the microservices for the MURAi Tagalog Profanity Detection System.

## Tagalog Profanity Detector

A FastAPI-based microservice that provides profanity detection for Tagalog text using RoBERTa and BERT models.

### Features

- Text profanity detection using RoBERTa Tagalog model
- Alternative BERT multilingual model support
- Model evaluation and metrics generation
- Health check endpoint
- Docker support for easy deployment

### Technologies Used

- Python 3.10+
- FastAPI
- Transformers (Hugging Face)
- PyTorch
- Docker

## Deployment

The microservice is configured for deployment on Render using Docker.

### Environment Variables

- `API_URL`: URL of the main MURAi server API
- `MICROSERVICE_API_KEY`: API key for authentication with the main server
- `MODEL_VERSION`: Version of the model being used
- `PORT`: Port to run the service on (default: 8000)

## API Endpoints

### Prediction

- `POST /predict`: Predict if text contains profanity
  - Parameters:
    - `text`: The input text to check
    - `model`: (Optional) Model to use (roberta or bert)

### Health Check

- `GET /health`: Check the health status of the API and models

### Metrics

- `POST /generate-metrics`: Generate and save model metrics
  - Parameters:
    - `model`: Model to evaluate (roberta or bert)

## Local Development

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn app:app --reload
```

## Docker

```bash
# Build the Docker image
docker build -t murai-model-service .

# Run the container
docker run -p 8000:8000 murai-model-service
```
