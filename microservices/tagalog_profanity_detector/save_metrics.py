import requests
import json
import os
import logging
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import numpy as np
import time

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Loaded environment variables from .env file")
except ImportError:
    print("python-dotenv not installed, using default environment variables")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("metrics-saver")

# Get environment variables
API_URL = os.environ.get('API_URL', 'http://localhost:5001')
API_KEY = os.environ.get('MICROSERVICE_API_KEY', 'your-api-key')
MODEL_VERSION = os.environ.get('MODEL_VERSION', 'v1.0.0')

def calculate_metrics(y_true, y_pred):
    """Calculate performance metrics from true and predicted labels."""
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary')

    # Calculate confusion matrix
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": {
            "TP": int(tp),
            "FP": int(fp),
            "TN": int(tn),
            "FN": int(fn)
        }
    }

def save_metrics_to_db(metrics_data, training_info=None):
    """Save metrics to the database via API."""
    if training_info is None:
        training_info = {
            "dataset_size": 13888,  # Default size of the tagalog-profanity-dataset
            "training_duration": "1h 23m"
        }

    payload = {
        "version": MODEL_VERSION,
        "performance": {
            "accuracy": metrics_data["accuracy"],
            "precision": metrics_data["precision"],
            "recall": metrics_data["recall"],
            "f1_score": metrics_data["f1_score"]
        },
        "training_info": training_info,
        "confusion_matrix": metrics_data["confusion_matrix"]
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    try:
        response = requests.post(
            f"{API_URL}/api/model/metrics/microservice",
            json=payload,
            headers=headers
        )

        if response.status_code == 201:
            logger.info(f"Metrics saved successfully: {response.json()}")
            return True
        else:
            logger.error(f"Failed to save metrics: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error saving metrics: {str(e)}")
        return False

def save_model_log(log_type, message):
    """Save a log message to the database."""
    payload = {
        "type": log_type,  # 'info', 'warning', or 'error'
        "message": message,
        "model_version": MODEL_VERSION
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    try:
        response = requests.post(
            f"{API_URL}/api/model/logs",
            json=payload,
            headers=headers
        )

        if response.status_code == 201:
            logger.info(f"Log saved successfully: {response.json()}")
            return True
        else:
            logger.error(f"Failed to save log: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error saving log: {str(e)}")
        return False

if __name__ == "__main__":
    # Example usage
    # This would typically be called after model evaluation
    y_true = np.random.randint(0, 2, size=100)  # Example ground truth
    y_pred = np.random.randint(0, 2, size=100)  # Example predictions

    metrics = calculate_metrics(y_true, y_pred)
    training_info = {
        "dataset_size": 13888,
        "training_duration": "1h 23m"
    }

    success = save_metrics_to_db(metrics, training_info)

    if success:
        save_model_log("info", f"Model {MODEL_VERSION} metrics saved successfully")
    else:
        save_model_log("error", f"Failed to save metrics for model {MODEL_VERSION}")
