from fastapi import FastAPI, HTTPException, status, Request
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import uvicorn
import os
import time
import logging
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("roberta-tagalog-profanity-detector")

app = FastAPI(
    title="RoBERTa Tagalog Profanity Detector API",
    description="API for detecting profanity in Tagalog text using RoBERTa model",
    version="1.0.0"
)

# Model path
MODEL_PATH = "./models/roberta-tagalog-profanity"

# Check if trained model exists, otherwise use the base model
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "jcblaise/roberta-tagalog-large"
    logger.warning(f"Trained RoBERTa model not found, using base model: {MODEL_PATH}")

# Log model path
logger.info(f"Using RoBERTa model: {MODEL_PATH}")

# Global variables for model and tokenizer
tokenizer = None
model = None
device = None
model_loaded = False
model_loading = False
last_error = None

# Initialize model and tokenizer
def initialize_model():
    global tokenizer, model, device, model_loaded, model_loading, last_error

    # If already loading, don't start another loading process
    if model_loading:
        logger.info("RoBERTa model is already being loaded by another request")
        return False

    # If already loaded successfully, don't reload
    if model_loaded:
        logger.info("RoBERTa model is already loaded")
        return True

    model_loading = True
    try:
        logger.info(f"Loading RoBERTa model from {MODEL_PATH}...")
        start_time = time.time()

        # Force CPU usage for inference
        device = torch.device("cpu")
        logger.info(f"Using device: {device} (GPU disabled for inference)")

        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=2)

        logger.info("RoBERTa tokenizer loaded successfully")
        logger.info("RoBERTa model loaded successfully")

        # Move model to device
        model.to(device)
        model.eval()

        elapsed_time = time.time() - start_time
        logger.info(f"RoBERTa model initialization completed in {elapsed_time:.2f} seconds")

        model_loaded = True
        last_error = None
        return True
    except Exception as e:
        logger.error(f"Error loading RoBERTa model: {str(e)}", exc_info=True)
        last_error = str(e)
        return False
    finally:
        model_loading = False

class TextRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    text: str
    is_inappropriate: bool
    confidence: float
    processing_time_ms: float
    model_used: str = "roberta"

class ModelStatusResponse(BaseModel):
    status: str
    model_status: str
    device: str
    model_path: str
    last_error: Optional[str] = None
    uptime_seconds: float

# Track when the service started
start_time = time.time()

@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_profanity(request: TextRequest):
    """
    Predict if the given text contains profanity in Tagalog using RoBERTa model.

    Parameters:
    - text: The input text to check for profanity

    Returns:
    - text: The input text
    - is_inappropriate: True if the text is detected as inappropriate
    - confidence: Confidence score of the prediction (0-1)
    - processing_time_ms: Time taken to process the request in milliseconds
    - model_used: Always "roberta"
    """
    prediction_start = time.time()

    # Check if model is loaded
    if not model_loaded:
        if model_loading:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RoBERTa model is currently loading. Please try again later."
            )

        # Try to initialize the model
        if not initialize_model():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load RoBERTa model: {last_error}"
            )

    try:
        # Validate input
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text cannot be empty"
            )

        # Tokenize and prepare input
        logger.info(f"Processing text with RoBERTa model: '{request.text[:50]}{'...' if len(request.text) > 50 else ''}'")
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

        logger.info(f"RoBERTa prediction: {'INAPPROPRIATE' if is_inappropriate else 'APPROPRIATE'} with confidence {confidence_value:.4f}")

        return {
            "text": request.text,
            "is_inappropriate": is_inappropriate,
            "confidence": confidence_value,
            "processing_time_ms": processing_time,
            "model_used": "roberta"
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Prediction error with RoBERTa model: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error with RoBERTa model: {str(e)}"
        )

@app.get("/health", response_model=ModelStatusResponse)
async def health_check():
    """
    Check the health status of the API and RoBERTa model.

    Returns:
    - status: API status (healthy/unhealthy)
    - model_status: RoBERTa model loading status
    - device: Device being used (CPU/CUDA)
    - model_path: Path of the RoBERTa model
    - last_error: Last error message if model failed to load
    - uptime_seconds: Time since the service started
    """
    uptime = time.time() - start_time

    return {
        "status": "healthy",
        "model_status": "loaded" if model_loaded else "loading" if model_loading else "not_loaded",
        "device": str(device) if device else "not set",
        "model_path": MODEL_PATH,
        "last_error": last_error,
        "uptime_seconds": uptime
    }

@app.get("/", include_in_schema=False)
async def root():
    """Redirect to docs"""
    return {"message": "RoBERTa Tagalog Profanity Detector API. Visit /docs for documentation."}

@app.on_event("startup")
async def startup_event():
    """Initialize the model when the application starts"""
    logger.info("Starting up the RoBERTa model service...")
    initialize_model()

if __name__ == "__main__":
    logger.info("Starting RoBERTa Tagalog Profanity Detector API...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
