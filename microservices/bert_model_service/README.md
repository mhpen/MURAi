# BERT Tagalog Profanity Detector Service

This microservice provides an API for detecting profanity in Tagalog text using a fine-tuned BERT model.

## Features

- Detects profanity in Tagalog text using a fine-tuned BERT model
- Provides confidence scores for predictions
- Supports both CPU and GPU inference
- Includes health check endpoint
- Containerized for easy deployment

## API Endpoints

- `POST /predict`: Predict if text contains profanity
- `GET /health`: Check the health status of the service

## Local Development

1. Create a virtual environment:
   ```
   python -m venv bert_venv
   bert_venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the service:
   ```
   uvicorn app:app --reload
   ```

4. Access the API documentation at http://localhost:8000/docs

## Deployment

### Docker

1. Build the Docker image:
   ```
   docker build -t mhpen/murai-bert-model-service:latest .
   ```

2. Run the container:
   ```
   docker run -p 8000:8000 mhpen/murai-bert-model-service:latest
   ```

### Render

This service can be deployed to Render using the provided `render.yaml` configuration.

## Model Information

- Model: Fine-tuned Google BERT Multilingual model
- Training dataset: Tagalog profanity dataset
- Performance:
  - Accuracy: 88.67%
  - Precision: 84.30%
  - Recall: 89.08%
  - F1 Score: 86.62%
