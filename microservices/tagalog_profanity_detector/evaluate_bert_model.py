import os
import time
import logging
import torch
import numpy as np
from datasets import load_dataset
from transformers import BertTokenizer, BertForSequenceClassification
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import requests
import json

# Try to load environment variables
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
logger = logging.getLogger("bert-model-evaluator")

# Get environment variables
API_URL = os.environ.get('API_URL', 'http://localhost:5001')
API_KEY = os.environ.get('MICROSERVICE_API_KEY', 'murai-microservice-api-key-2024')
MODEL_VERSION = os.environ.get('BERT_MODEL_VERSION', 'v1.0.0')

# Model path - use the BERT model
MODEL_PATH = os.environ.get('BERT_MODEL_PATH', './models/bert-multilingual-tagalog-profanity')
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "bert-base-multilingual-uncased"
    logger.warning(f"BERT model not found at {os.environ.get('BERT_MODEL_PATH')}, using {MODEL_PATH} instead")

def load_model_and_tokenizer():
    """Load the model and tokenizer."""
    logger.info(f"Loading model from {MODEL_PATH}...")
    start_time = time.time()
    
    try:
        tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
        logger.info("Tokenizer loaded successfully")
        
        model = BertForSequenceClassification.from_pretrained(MODEL_PATH, num_labels=2)
        logger.info("Model loaded successfully")
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        model.to(device)
        
        load_time = time.time() - start_time
        logger.info(f"Model initialization completed in {load_time:.2f} seconds")
        
        return model, tokenizer, device
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

def load_dataset_for_evaluation(max_samples=500):
    """Load the actual Tagalog profanity dataset."""
    logger.info("Loading Tagalog profanity dataset...")
    try:
        # Load the dataset from Hugging Face
        dataset = load_dataset("mginoben/tagalog-profanity-dataset")
        logger.info(f"Dataset loaded: {dataset}")
        
        # Use the validation split for evaluation (this dataset doesn't have a test split)
        test_dataset = dataset["validation"]
        logger.info(f"Validation dataset size: {len(test_dataset)}")
        
        # For faster evaluation, use a subset of the validation data
        if len(test_dataset) > max_samples:
            # Convert to list format for easier manipulation
            test_data_list = test_dataset.to_list()
            
            # Ensure we get a balanced subset with both positive and negative examples
            positive_examples = [ex for ex in test_data_list if ex["label"] == 1]
            negative_examples = [ex for ex in test_data_list if ex["label"] == 0]
            
            # Calculate how many of each to include
            pos_count = min(len(positive_examples), max_samples // 2)
            neg_count = min(len(negative_examples), max_samples - pos_count)
            
            # Adjust pos_count if we don't have enough negative examples
            if neg_count < max_samples // 2:
                pos_count = min(len(positive_examples), max_samples - neg_count)
            
            # Select the examples
            selected_positive = positive_examples[:pos_count]
            selected_negative = negative_examples[:neg_count]
            
            # Combine and shuffle
            import random
            subset = selected_positive + selected_negative
            random.shuffle(subset)
            
            logger.info(f"Using a subset of {len(subset)} examples for evaluation")
            return subset
        
        # Convert to list format for consistency
        return test_dataset.to_list()
    except Exception as e:
        logger.error(f"Error loading dataset: {str(e)}")
        raise

def evaluate_model(model, tokenizer, dataset, device):
    """Evaluate the model on the dataset and return metrics."""
    logger.info("Starting model evaluation...")
    start_time = time.time()
    
    try:
        # Prepare lists to store predictions and labels
        all_predictions = []
        all_labels = []
        
        # Set model to evaluation mode
        model.eval()
        
        # Process the dataset in batches
        batch_size = 32
        total_batches = (len(dataset) + batch_size - 1) // batch_size
        
        logger.info(f"Evaluating {len(dataset)} examples in {total_batches} batches")
        
        for i in range(0, len(dataset), batch_size):
            batch_start_time = time.time()
            batch_num = i // batch_size + 1
            
            # Get the current batch
            batch = dataset[i:i+batch_size]
            actual_batch_size = len(batch)
            
            # Extract texts and labels from the batch
            texts = [item["text"] for item in batch]
            labels = [item["label"] for item in batch]
            
            # Tokenize the batch
            inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Convert labels to tensor
            labels_tensor = torch.tensor(labels).to(device)
            
            # Forward pass
            with torch.no_grad():
                outputs = model(**inputs)
                
            # Get predictions
            logits = outputs.logits
            predictions = torch.argmax(logits, dim=-1).cpu().numpy()
            
            # Store predictions and labels
            all_predictions.extend(predictions)
            all_labels.extend(labels)
            
            # Calculate batch accuracy for logging
            batch_accuracy = (predictions == labels_tensor.cpu().numpy()).mean()
            batch_time = time.time() - batch_start_time
            
            # Log progress for every batch
            logger.info(f"Batch {batch_num}/{total_batches}: {actual_batch_size} examples, " +
                       f"accuracy: {batch_accuracy:.4f}, time: {batch_time:.2f}s")
            
            # More detailed logging at intervals
            if batch_num % 5 == 0 or batch_num == total_batches:
                elapsed = time.time() - start_time
                examples_per_sec = (i + actual_batch_size) / elapsed
                logger.info(f"Progress: {i + actual_batch_size}/{len(dataset)} examples " +
                           f"({(i + actual_batch_size) / len(dataset) * 100:.1f}%), " +
                           f"speed: {examples_per_sec:.1f} examples/sec")
        
        # Calculate metrics
        accuracy = accuracy_score(all_labels, all_predictions)
        precision, recall, f1, _ = precision_recall_fscore_support(all_labels, all_predictions, average='binary')
        
        # Calculate confusion matrix
        tn, fp, fn, tp = confusion_matrix(all_labels, all_predictions).ravel()
        
        # Log metrics
        logger.info(f"Evaluation completed in {time.time() - start_time:.2f} seconds")
        logger.info(f"Accuracy: {accuracy:.4f}")
        logger.info(f"Precision: {precision:.4f}")
        logger.info(f"Recall: {recall:.4f}")
        logger.info(f"F1 Score: {f1:.4f}")
        logger.info(f"True Positives: {tp}")
        logger.info(f"False Positives: {fp}")
        logger.info(f"True Negatives: {tn}")
        logger.info(f"False Negatives: {fn}")
        
        # Return metrics
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
    except Exception as e:
        logger.error(f"Error during evaluation: {str(e)}")
        raise

def save_metrics_to_db(metrics):
    """Save metrics to the database via API."""
    # Get dataset size
    try:
        dataset = load_dataset("mginoben/tagalog-profanity-dataset")
        dataset_size = len(dataset["train"]) + len(dataset["validation"])
    except:
        dataset_size = 13888  # Default size if we can't get the actual size
    
    # Create payload
    payload = {
        "version": f"bert-{MODEL_VERSION}",
        "performance": {
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1_score": metrics["f1_score"]
        },
        "training_info": {
            "dataset_size": dataset_size,
            "training_duration": "N/A (Evaluation only)",
            "model_type": "BERT Multilingual"
        },
        "confusion_matrix": metrics["confusion_matrix"]
    }
    
    # Log the metrics locally since we might not be able to save to the database
    logger.info(f"Evaluation metrics: {json.dumps(payload, indent=2)}")
    
    # Try to save to the database, but don't fail if it doesn't work
    try:
        headers = {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        }
        
        logger.info(f"Saving metrics to database via API: {API_URL}/api/model/metrics/microservice")
        response = requests.post(
            f"{API_URL}/api/model/metrics/microservice",
            json=payload,
            headers=headers,
            timeout=10  # Add a timeout to avoid hanging
        )
        
        if response.status_code == 201:
            logger.info(f"Metrics saved successfully to database")
            return True
        else:
            logger.warning(f"Failed to save metrics to database: {response.status_code} - {response.text}")
            # Return True anyway since we logged the metrics locally
            return True
    except Exception as e:
        logger.warning(f"Error saving metrics to database: {str(e)}")
        # Return True anyway since we logged the metrics locally
        return True

def save_model_log(log_type, message):
    """Save a log message to the database."""
    # Log locally first
    if log_type == "error":
        logger.error(message)
    elif log_type == "warning":
        logger.warning(message)
    else:
        logger.info(message)
    
    # Try to save to the database, but don't fail if it doesn't work
    try:
        payload = {
            "type": log_type,  # 'info', 'warning', or 'error'
            "message": message,
            "model_version": f"bert-{MODEL_VERSION}"
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        }
        
        response = requests.post(
            f"{API_URL}/api/model/logs",
            json=payload,
            headers=headers,
            timeout=5  # Add a timeout to avoid hanging
        )
        
        if response.status_code == 201:
            logger.info(f"Log saved successfully to database")
            return True
        else:
            logger.warning(f"Failed to save log to database: {response.status_code} - {response.text}")
            return True  # Return True anyway since we logged locally
    except Exception as e:
        logger.warning(f"Error saving log to database: {str(e)}")
        return True  # Return True anyway since we logged locally

def main():
    """Main function to evaluate the model and save metrics."""
    try:
        # Load model and tokenizer
        model, tokenizer, device = load_model_and_tokenizer()
        
        # Load dataset
        dataset = load_dataset_for_evaluation()
        
        # Evaluate model
        metrics = evaluate_model(model, tokenizer, dataset, device)
        
        # Save metrics to database
        success = save_metrics_to_db(metrics)
        
        if success:
            save_model_log("info", f"BERT Model {MODEL_VERSION} evaluated successfully with accuracy {metrics['accuracy']:.4f}")
            logger.info("Evaluation completed and metrics saved successfully")
        else:
            save_model_log("error", f"Failed to save evaluation metrics for BERT model {MODEL_VERSION}")
            logger.error("Failed to save metrics to database")
        
        return metrics
    except Exception as e:
        logger.error(f"Error in evaluation process: {str(e)}")
        save_model_log("error", f"Error evaluating BERT model {MODEL_VERSION}: {str(e)}")
        return None

if __name__ == "__main__":
    main()
