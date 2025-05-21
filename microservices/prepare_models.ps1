# PowerShell script to prepare model files for Docker builds

Write-Host "Preparing model files for Docker builds..." -ForegroundColor Green

# Source model directories
$BERT_SOURCE_PATH = ".\tagalog_profanity_detector\models\google-bert-multilingual-tagalog-profanity"
$ROBERTA_SOURCE_PATH = ".\tagalog_profanity_detector\models\roberta-tagalog-profanity"

# Destination model directories
$BERT_DEST_PATH = ".\bert_model_service\models\google-bert-multilingual-tagalog-profanity"
$ROBERTA_DEST_PATH = ".\roberta_model_service\models\roberta-tagalog-profanity"

# Create destination directories if they don't exist
if (-not (Test-Path -Path $BERT_DEST_PATH)) {
    Write-Host "Creating BERT model destination directory..." -ForegroundColor Yellow
    New-Item -Path $BERT_DEST_PATH -ItemType Directory -Force | Out-Null
}

if (-not (Test-Path -Path $ROBERTA_DEST_PATH)) {
    Write-Host "Creating RoBERTa model destination directory..." -ForegroundColor Yellow
    New-Item -Path $ROBERTA_DEST_PATH -ItemType Directory -Force | Out-Null
}

# Copy BERT model files
if (Test-Path -Path $BERT_SOURCE_PATH) {
    Write-Host "Copying BERT model files..." -ForegroundColor Yellow
    Copy-Item -Path "$BERT_SOURCE_PATH\*" -Destination $BERT_DEST_PATH -Recurse -Force
    Write-Host "BERT model files copied successfully." -ForegroundColor Green
} else {
    Write-Host "Error: BERT model directory not found at $BERT_SOURCE_PATH" -ForegroundColor Red
    exit 1
}

# Copy RoBERTa model files
if (Test-Path -Path $ROBERTA_SOURCE_PATH) {
    Write-Host "Copying RoBERTa model files..." -ForegroundColor Yellow
    Copy-Item -Path "$ROBERTA_SOURCE_PATH\*" -Destination $ROBERTA_DEST_PATH -Recurse -Force
    Write-Host "RoBERTa model files copied successfully." -ForegroundColor Green
} else {
    Write-Host "Error: RoBERTa model directory not found at $ROBERTA_SOURCE_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Model files prepared successfully for Docker builds." -ForegroundColor Green
