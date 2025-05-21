from fastapi import FastAPI, HTTPException, status, Request, Query
from pydantic import BaseModel
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    BertTokenizer,
    BertForSequenceClassification
)
import torch
import uvicorn
import os
import sys
import time
import logging
from enum import Enum
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("tagalog-profanity-detector")

app = FastAPI(
    title="Tagalog Profanity Detector API",
    description="API for detecting profanity in Tagalog text using RoBERTa model",
    version="1.0.0"
)

# Define model types
class ModelType(str, Enum):
    ROBERTA = "roberta"
    BERT = "bert"

# Model paths
MODEL_PATHS = {
    ModelType.ROBERTA: "jcblaise/roberta-tagalog-large",
    ModelType.BERT: "./models/google-bert-multilingual-tagalog-profanity"
}

# Check if trained BERT model exists, otherwise use the base model
if not os.path.exists(MODEL_PATHS[ModelType.BERT]):
    MODEL_PATHS[ModelType.BERT] = "google-bert/bert-base-multilingual-uncased"
    logger.warning(f"Trained BERT model not found, using base model: {MODEL_PATHS[ModelType.BERT]}")

# Log model paths
logger.info(f"Using RoBERTa model: {MODEL_PATHS[ModelType.ROBERTA]}")
logger.info(f"Using BERT model: {MODEL_PATHS[ModelType.BERT]}")

# Global variables for models and tokenizers
tokenizers = {
    ModelType.ROBERTA: None,
    ModelType.BERT: None
}
models = {
    ModelType.ROBERTA: None,
    ModelType.BERT: None
}
device = None
model_loaded = {
    ModelType.ROBERTA: False,
    ModelType.BERT: False
}
model_loading = {
    ModelType.ROBERTA: False,
    ModelType.BERT: False
}
last_error = {
    ModelType.ROBERTA: None,
    ModelType.BERT: None
}

# Default active model
active_model = ModelType.ROBERTA

# Initialize model and tokenizer
def initialize_model(model_type: ModelType = None):
    global tokenizers, models, device, model_loaded, model_loading, last_error, active_model

    # If no model type specified, use the active model
    if model_type is None:
        model_type = active_model

    # If already loading, don't start another loading process
    if model_loading[model_type]:
        logger.info(f"{model_type.capitalize()} model is already being loaded by another request")
        return False

    # If already loaded successfully, don't reload
    if model_loaded[model_type]:
        logger.info(f"{model_type.capitalize()} model is already loaded")
        return True

    model_loading[model_type] = True
    try:
        model_path = MODEL_PATHS[model_type]
        logger.info(f"Loading {model_type.capitalize()} model from {model_path}...")
        start_time = time.time()

        # Set device if not already set
        if device is None:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {device}")

        # Load tokenizer and model based on model type
        if model_type == ModelType.ROBERTA:
            tokenizers[model_type] = AutoTokenizer.from_pretrained(model_path)
            models[model_type] = AutoModelForSequenceClassification.from_pretrained(model_path, num_labels=2)
        elif model_type == ModelType.BERT:
            tokenizers[model_type] = BertTokenizer.from_pretrained(model_path)
            models[model_type] = BertForSequenceClassification.from_pretrained(model_path, num_labels=2)

        logger.info(f"{model_type.capitalize()} tokenizer loaded successfully")
        logger.info(f"{model_type.capitalize()} model loaded successfully")

        # Move model to device
        models[model_type].to(device)
        models[model_type].eval()

        elapsed_time = time.time() - start_time
        logger.info(f"{model_type.capitalize()} model initialization completed in {elapsed_time:.2f} seconds")

        model_loaded[model_type] = True
        last_error[model_type] = None
        return True
    except Exception as e:
        logger.error(f"Error loading {model_type.capitalize()} model: {str(e)}", exc_info=True)
        last_error[model_type] = str(e)
        return False
    finally:
        model_loading[model_type] = False

class TextRequest(BaseModel):
    text: str
    model: Optional[ModelType] = None

class PredictionResponse(BaseModel):
    text: str
    is_inappropriate: bool
    confidence: float
    processing_time_ms: float
    model_used: str

class ModelStatusResponse(BaseModel):
    status: str
    roberta_status: str
    bert_status: str
    device: str
    roberta_model: str
    bert_model: str
    active_model: str
    last_error: dict = {}
    uptime_seconds: float

# Track when the service started
start_time = time.time()

@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_profanity(request: TextRequest):
    """
    Predict if the given text contains profanity in Tagalog.

    Parameters:
    - text: The input text to check for profanity
    - model: Optional model to use (roberta or bert). If not specified, uses the active model.

    Returns:
    - text: The input text
    - is_inappropriate: True if the text is detected as inappropriate
    - confidence: Confidence score of the prediction (0-1)
    - processing_time_ms: Time taken to process the request in milliseconds
    - model_used: The model used for prediction
    """
    global active_model
    prediction_start = time.time()

    # Determine which model to use
    model_type = request.model if request.model else active_model

    # Check if model is loaded
    if not model_loaded[model_type]:
        if model_loading[model_type]:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"{model_type.capitalize()} model is currently loading. Please try again later."
            )

        # Try to initialize the model
        if not initialize_model(model_type):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load {model_type.capitalize()} model: {last_error[model_type]}"
            )

    try:
        # Validate input
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text cannot be empty"
            )

        # Get the model and tokenizer
        model = models[model_type]
        tokenizer = tokenizers[model_type]

        # Tokenize and prepare input
        logger.info(f"Processing text with {model_type.capitalize()} model: '{request.text[:50]}{'...' if len(request.text) > 50 else ''}'")
        inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=512).to(device)

        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)

        # Process results
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1)
        confidence, prediction = torch.max(probabilities, dim=1)

        is_inappropriate = bool(prediction.item())
        confidence_value = confidence.item()

        # Calculate processing time
        processing_time = (time.time() - prediction_start) * 1000  # Convert to milliseconds

        logger.info(f"{model_type.capitalize()} prediction: {'INAPPROPRIATE' if is_inappropriate else 'APPROPRIATE'} with confidence {confidence_value:.4f}")

        return {
            "text": request.text,
            "is_inappropriate": is_inappropriate,
            "confidence": confidence_value,
            "processing_time_ms": processing_time,
            "model_used": model_type
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Prediction error with {model_type.capitalize()} model: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error with {model_type.capitalize()} model: {str(e)}"
        )

@app.get("/health", response_model=ModelStatusResponse)
async def health_check():
    """
    Check the health status of the API and models.

    Returns:
    - status: API status (healthy/unhealthy)
    - roberta_status: RoBERTa model loading status
    - bert_status: BERT model loading status
    - device: Device being used (CPU/CUDA)
    - roberta_model: Path of the RoBERTa model
    - bert_model: Path of the BERT model
    - active_model: Currently active model
    - last_error: Last error messages if models failed to load
    - uptime_seconds: Time since the service started
    """
    uptime = time.time() - start_time

    return {
        "status": "healthy",
        "roberta_status": "loaded" if model_loaded[ModelType.ROBERTA] else "loading" if model_loading[ModelType.ROBERTA] else "not_loaded",
        "bert_status": "loaded" if model_loaded[ModelType.BERT] else "loading" if model_loading[ModelType.BERT] else "not_loaded",
        "device": str(device) if device else "not set",
        "roberta_model": MODEL_PATHS[ModelType.ROBERTA],
        "bert_model": MODEL_PATHS[ModelType.BERT],
        "active_model": active_model,
        "last_error": {
            ModelType.ROBERTA: last_error[ModelType.ROBERTA],
            ModelType.BERT: last_error[ModelType.BERT]
        },
        "uptime_seconds": uptime
    }

@app.post("/switch-model/{model_type}", status_code=status.HTTP_200_OK)
async def switch_model(model_type: ModelType):
    """
    Switch the active model between RoBERTa and BERT.

    Parameters:
    - model_type: The model to switch to (roberta or bert)

    Returns:
    - message: Success message
    - active_model: The new active model
    """
    global active_model

    # Check if the model is loaded
    if not model_loaded[model_type]:
        if model_loading[model_type]:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"{model_type.capitalize()} model is currently loading. Please try again later."
            )

        # Try to initialize the model
        if not initialize_model(model_type):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load {model_type.capitalize()} model: {last_error[model_type]}"
            )

    # Switch the active model
    active_model = model_type
    logger.info(f"Switched active model to {model_type.capitalize()}")

    return {
        "message": f"Successfully switched to {model_type.capitalize()} model",
        "active_model": model_type
    }

@app.get("/", include_in_schema=False)
async def root():
    """Redirect to docs"""
    return {"message": "Tagalog Profanity Detector API. Visit /docs for documentation."}

@app.on_event("startup")
async def startup_event():
    """Initialize the models when the application starts"""
    logger.info("Starting up the application...")

    # Start RoBERTa model loading in background
    logger.info("Initializing RoBERTa model...")
    initialize_model(ModelType.ROBERTA)

    # Start BERT model loading in background
    logger.info("Initializing BERT model...")
    initialize_model(ModelType.BERT)

@app.post("/metrics/save", status_code=status.HTTP_200_OK)
async def save_metrics_endpoint(request: Request, model_type: Optional[ModelType] = None):
    """
    Endpoint to trigger metrics calculation and saving to the database.
    This is typically called after model evaluation or periodically.

    Parameters:
    - model_type: Optional model to evaluate (roberta or bert). If not specified, uses the active model.
    """
    try:
        # For quick testing, use random metrics
        if request.query_params.get("mode") == "quick":
            import numpy as np

            # Determine which model to use
            model_to_evaluate = model_type if model_type else active_model

            # Generate random metrics for testing
            accuracy = 0.92 + (np.random.random() * 0.05)
            precision = 0.90 + (np.random.random() * 0.05)
            recall = 0.88 + (np.random.random() * 0.05)
            f1_score = 0.89 + (np.random.random() * 0.05)

            # Create metrics object
            metrics = {
                "version": f"{model_to_evaluate}-v1.0.0",
                "performance": {
                    "accuracy": float(accuracy),
                    "precision": float(precision),
                    "recall": float(recall),
                    "f1_score": float(f1_score)
                },
                "training_info": {
                    "dataset_size": 13888,
                    "training_duration": "N/A (Sample metrics)",
                    "model_type": model_to_evaluate.capitalize()
                },
                "confusion_matrix": {
                    "TP": 5500,
                    "FP": 450,
                    "TN": 7200,
                    "FN": 738
                }
            }

            # Return the metrics directly for testing
            return {
                "status": "success",
                "message": f"Sample metrics generated for {model_to_evaluate.capitalize()} model",
                "metrics": metrics
            }

        # For actual evaluation, run the evaluation script
        else:
            # Determine which model to evaluate
            model_to_evaluate = model_type if model_type else active_model

            logger.info(f"Starting actual {model_to_evaluate.capitalize()} model evaluation...")

            if model_to_evaluate == ModelType.ROBERTA:
                # Import the RoBERTa evaluation module
                from evaluate_model import main as evaluate_roberta

                # Run the evaluation
                metrics = evaluate_roberta()
            else:
                # Import the BERT evaluation module
                from evaluate_bert_model import main as evaluate_bert

                # Run the evaluation
                metrics = evaluate_bert()

            if metrics:
                return {
                    "status": "success",
                    "message": f"{model_to_evaluate.capitalize()} model evaluated successfully with real data",
                    "metrics": metrics
                }
            else:
                return {
                    "status": "error",
                    "message": f"Failed to evaluate {model_to_evaluate.capitalize()} model with real data"
                }
    except Exception as e:
        logger.error(f"Error generating metrics: {str(e)}")
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    logger.info("Starting Tagalog Profanity Detector API...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)