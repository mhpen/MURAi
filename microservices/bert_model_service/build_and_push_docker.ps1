# PowerShell script to build and push the BERT model service Docker image

# Set variables
$DOCKER_USERNAME = "mhpen"  # Replace with your Docker Hub username
$IMAGE_NAME = "murai-bert-model-service"
$TAG = "latest"
$FULL_IMAGE_NAME = "${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

# Create models directory if it doesn't exist
if (-not (Test-Path -Path ".\models")) {
    New-Item -Path ".\models" -ItemType Directory
}

# Copy BERT model files from the main model directory
$SOURCE_MODEL_PATH = "..\tagalog_profanity_detector\models\google-bert-multilingual-tagalog-profanity"
$DEST_MODEL_PATH = ".\models\google-bert-multilingual-tagalog-profanity"

if (Test-Path -Path $SOURCE_MODEL_PATH) {
    Write-Host "Copying BERT model files..."
    if (-not (Test-Path -Path $DEST_MODEL_PATH)) {
        New-Item -Path $DEST_MODEL_PATH -ItemType Directory
    }
    Copy-Item -Path "$SOURCE_MODEL_PATH\*" -Destination $DEST_MODEL_PATH -Recurse -Force
    Write-Host "Model files copied successfully."
} else {
    Write-Host "Warning: BERT model directory not found at $SOURCE_MODEL_PATH"
    Write-Host "The Docker image will be built without the model files."
    Write-Host "The service will use the base model from Hugging Face instead."
}

# Build the Docker image
Write-Host "Building Docker image: $FULL_IMAGE_NAME"
docker build -t $FULL_IMAGE_NAME .

# Push the image to Docker Hub
Write-Host "Pushing Docker image to Docker Hub..."
docker push $FULL_IMAGE_NAME

Write-Host "Done! Image $FULL_IMAGE_NAME has been built and pushed to Docker Hub."
