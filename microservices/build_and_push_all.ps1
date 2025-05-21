# PowerShell script to build and push both model service Docker images

# Set variables
$DOCKER_USERNAME = "mhpen"  # Replace with your Docker Hub username
$BERT_IMAGE_NAME = "murai-bert-model-service"
$ROBERTA_IMAGE_NAME = "murai-roberta-model-service"
$TAG = "latest"
$BERT_FULL_IMAGE_NAME = "${DOCKER_USERNAME}/${BERT_IMAGE_NAME}:${TAG}"
$ROBERTA_FULL_IMAGE_NAME = "${DOCKER_USERNAME}/${ROBERTA_IMAGE_NAME}:${TAG}"

# First, prepare the model files
Write-Host "Preparing model files..." -ForegroundColor Green
& .\prepare_models.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error preparing model files. Exiting." -ForegroundColor Red
    exit 1
}

# Build BERT model service Docker image
Write-Host "Building BERT model service Docker image: $BERT_FULL_IMAGE_NAME" -ForegroundColor Green
Set-Location -Path .\bert_model_service
docker build -t $BERT_FULL_IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building BERT Docker image. Exiting." -ForegroundColor Red
    Set-Location -Path ..
    exit 1
}

# Push BERT image to Docker Hub
Write-Host "Pushing BERT Docker image to Docker Hub..." -ForegroundColor Green
docker push $BERT_FULL_IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing BERT Docker image. Exiting." -ForegroundColor Red
    Set-Location -Path ..
    exit 1
}

Write-Host "BERT Docker image built and pushed successfully." -ForegroundColor Green
Set-Location -Path ..

# Build RoBERTa model service Docker image
Write-Host "Building RoBERTa model service Docker image: $ROBERTA_FULL_IMAGE_NAME" -ForegroundColor Green
Set-Location -Path .\roberta_model_service
docker build -t $ROBERTA_FULL_IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building RoBERTa Docker image. Exiting." -ForegroundColor Red
    Set-Location -Path ..
    exit 1
}

# Push RoBERTa image to Docker Hub
Write-Host "Pushing RoBERTa Docker image to Docker Hub..." -ForegroundColor Green
docker push $ROBERTA_FULL_IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing RoBERTa Docker image. Exiting." -ForegroundColor Red
    Set-Location -Path ..
    exit 1
}

Write-Host "RoBERTa Docker image built and pushed successfully." -ForegroundColor Green
Set-Location -Path ..

Write-Host "All Docker images built and pushed successfully!" -ForegroundColor Green
Write-Host "BERT image: $BERT_FULL_IMAGE_NAME" -ForegroundColor Cyan
Write-Host "RoBERTa image: $ROBERTA_FULL_IMAGE_NAME" -ForegroundColor Cyan
