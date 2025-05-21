# PowerShell script to build and push the RoBERTa model service Docker image

# Configuration
$DOCKER_USERNAME = "mhpen"  # Replace with your Docker Hub username
$IMAGE_NAME = "murai-roberta-model-service"
$TAG = "latest"
$FULL_IMAGE_NAME = "${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

# Display script header
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Building and Pushing RoBERTa Model Service Docker Image" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version
    Write-Host "Docker is installed." -ForegroundColor Green
}
catch {
    Write-Host "Docker is not installed or not in PATH. Please install Docker and try again." -ForegroundColor Red
    exit 1
}

# Create models directory if it doesn't exist
if (-not (Test-Path -Path ".\models")) {
    New-Item -Path ".\models" -ItemType Directory
    Write-Host "Created models directory." -ForegroundColor Green
}

# Copy RoBERTa model files from the main model directory
$SOURCE_MODEL_PATH = "..\tagalog_profanity_detector\models\roberta-tagalog-profanity"
$DEST_MODEL_PATH = ".\models\roberta-tagalog-profanity"

if (Test-Path -Path $SOURCE_MODEL_PATH) {
    Write-Host "Copying RoBERTa model files..." -ForegroundColor Yellow
    if (-not (Test-Path -Path $DEST_MODEL_PATH)) {
        New-Item -Path $DEST_MODEL_PATH -ItemType Directory
    }
    Copy-Item -Path "$SOURCE_MODEL_PATH\*" -Destination $DEST_MODEL_PATH -Recurse -Force
    Write-Host "Model files copied successfully." -ForegroundColor Green
} else {
    # Check if model files already exist in the destination
    if (Test-Path -Path $DEST_MODEL_PATH) {
        $modelFiles = Get-ChildItem -Path $DEST_MODEL_PATH
        if ($modelFiles.Count -gt 0) {
            Write-Host "Using existing model files in $DEST_MODEL_PATH" -ForegroundColor Green
        } else {
            Write-Host "Warning: RoBERTa model directory is empty at $DEST_MODEL_PATH" -ForegroundColor Yellow
            Write-Host "The service will use the base model from Hugging Face instead." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Warning: RoBERTa model directory not found at $SOURCE_MODEL_PATH" -ForegroundColor Yellow
        Write-Host "The Docker image will be built without the model files." -ForegroundColor Yellow
        Write-Host "The service will use the base model from Hugging Face instead." -ForegroundColor Yellow
    }
}

# Build the Docker image
Write-Host "Building Docker image: $FULL_IMAGE_NAME..." -ForegroundColor Yellow
docker build -t $FULL_IMAGE_NAME .

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Docker image built successfully: $FULL_IMAGE_NAME" -ForegroundColor Green

# Ask if user wants to run the container locally
$runLocally = Read-Host "Do you want to run the container locally for testing? (y/n)"
if ($runLocally -eq "y" -or $runLocally -eq "Y") {
    # Check if the container is already running
    $containerRunning = docker ps -q --filter "name=murai-roberta"
    if ($containerRunning) {
        Write-Host "Container is already running. Stopping it..." -ForegroundColor Yellow
        docker stop murai-roberta
        docker rm murai-roberta
    }

    # Run the container
    Write-Host "Running container locally on port 8000..." -ForegroundColor Yellow
    docker run -d --name murai-roberta -p 8000:8000 $FULL_IMAGE_NAME

    # Check if container started successfully
    Start-Sleep -Seconds 5
    $containerRunning = docker ps -q --filter "name=murai-roberta"
    if ($containerRunning) {
        Write-Host "Container is running. You can access the API at http://localhost:8000" -ForegroundColor Green
        Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Green

        # Open browser to the API docs
        $openBrowser = Read-Host "Open API documentation in browser? (y/n)"
        if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
            Start-Process "http://localhost:8000/docs"
        }
    } else {
        Write-Host "Container failed to start. Check logs with: docker logs murai-roberta" -ForegroundColor Red
    }
}

# Ask if user wants to push to Docker Hub
$pushToHub = Read-Host "Do you want to push the image to Docker Hub? (y/n)"
if ($pushToHub -eq "y" -or $pushToHub -eq "Y") {
    # Check if user is logged in to Docker Hub
    Write-Host "Checking Docker Hub login status..." -ForegroundColor Yellow
    $loginStatus = docker info 2>&1 | Select-String "Username"

    if (-not $loginStatus) {
        Write-Host "You are not logged in to Docker Hub. Please log in:" -ForegroundColor Yellow
        docker login

        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to log in to Docker Hub. Aborting push." -ForegroundColor Red
            exit 1
        }
    }

    # Push to Docker Hub
    Write-Host "Pushing image to Docker Hub..." -ForegroundColor Yellow
    docker push $FULL_IMAGE_NAME

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to push image to Docker Hub." -ForegroundColor Red
    } else {
        Write-Host "Image pushed successfully to: $FULL_IMAGE_NAME" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Docker Build Process Complete" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
