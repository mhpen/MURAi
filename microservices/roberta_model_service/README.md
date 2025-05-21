# RoBERTa Tagalog Profanity Detector Service

This microservice provides an API for detecting profanity in Tagalog text using a fine-tuned RoBERTa model.

## Features

- Detects profanity in Tagalog text using a fine-tuned RoBERTa model
- Provides confidence scores for predictions
- Optimized for CPU inference
- Includes health check endpoint
- Containerized for easy deployment

## API Endpoints

### Predict Profanity

```
POST /predict
```

Request body:
```json
{
  "text": "Your Tagalog text here"
}
```

Response:
```json
{
  "text": "Your Tagalog text here",
  "is_inappropriate": true,
  "confidence": 0.95,
  "processing_time_ms": 123.45,
  "model_used": "roberta"
}
```

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_status": "loaded",
  "device": "cpu",
  "model_path": "./models/roberta-tagalog-profanity",
  "last_error": null,
  "uptime_seconds": 1234.56
}
```

## Local Development

1. Create a virtual environment:
   ```
   python -m venv roberta_venv
   roberta_venv\Scripts\activate
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

## Docker Deployment

### Using the Build Script (Recommended)

The easiest way to build and deploy the Docker image is using the provided PowerShell script:

```
.\build_and_push_docker.ps1
```

This script will:
- Build the Docker image
- Optionally run the container locally for testing
- Optionally push the image to Docker Hub

### Manual Docker Commands

1. Build the Docker image:
   ```
   docker build -t mhpen/murai-roberta-model-service:latest .
   ```

2. Run the container locally:
   ```
   docker run -d -p 8000:8000 --name murai-roberta mhpen/murai-roberta-model-service:latest
   ```

3. Push to Docker Hub (after logging in):
   ```
   docker push mhpen/murai-roberta-model-service:latest
   ```

## Deploying to Render

This service can be deployed to [Render](https://render.com) using the provided `render.yaml` configuration.

### Option 1: Deploy from Docker Hub (Recommended)

1. Push your Docker image to Docker Hub using the build script
2. In Render dashboard, create a new Web Service
3. Select "Deploy an existing image"
4. Enter your Docker Hub image URL: `mhpen/murai-roberta-model-service:latest`
5. Set the environment variables as specified in `render.yaml`
6. Click "Create Web Service"

### Option 2: Deploy from GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Create a new Blueprint
4. Render will use the `render.yaml` configuration to deploy the service

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TRANSFORMERS_CACHE | Cache directory for Hugging Face models | /app/models |
| CUDA_VISIBLE_DEVICES | Set to -1 to disable GPU | -1 |
| OMP_NUM_THREADS | Number of CPU threads to use | 4 |
| PYTORCH_NO_CUDA_MEMORY_CACHING | Disable CUDA memory caching | 1 |

## Model Information

- Model: Fine-tuned RoBERTa Tagalog model based on `jcblaise/roberta-tagalog-large`
- Training dataset: [Tagalog Profanity Dataset](https://huggingface.co/datasets/mginoben/tagalog-profanity-dataset)
- Performance:
  - Accuracy: 90.47%
  - Precision: 89.29%
  - Recall: 87.34%
  - F1 Score: 88.30%
