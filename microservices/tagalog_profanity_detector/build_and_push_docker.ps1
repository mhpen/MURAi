# Script to build and push the Docker image to Docker Hub

# Configuration
$dockerHubUsername = Read-Host "Enter your Docker Hub username"
$imageName = "murai-model-service"
$imageTag = "latest"
$fullImageName = "$dockerHubUsername/$imageName`:$imageTag"

Write-Host "Building and pushing Docker image to Docker Hub..." -ForegroundColor Green
Write-Host "Image will be tagged as: $fullImageName" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "`nStep 1: Building Docker image..." -ForegroundColor Yellow
docker build -t $imageName`:$imageTag -f Dockerfile.render .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

# Tag the image for Docker Hub
Write-Host "`nStep 2: Tagging Docker image for Docker Hub..." -ForegroundColor Yellow
docker tag $imageName`:$imageTag $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker tag failed." -ForegroundColor Red
    exit 1
}

# Log in to Docker Hub
Write-Host "`nStep 3: Logging in to Docker Hub..." -ForegroundColor Yellow
Write-Host "Please enter your Docker Hub password when prompted."
docker login --username $dockerHubUsername

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker login failed." -ForegroundColor Red
    exit 1
}

# Push the image to Docker Hub
Write-Host "`nStep 4: Pushing Docker image to Docker Hub..." -ForegroundColor Yellow
docker push $fullImageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker push failed." -ForegroundColor Red
    exit 1
}

# Update render.yaml with the correct image URL
Write-Host "`nStep 5: Updating render.yaml with the correct image URL..." -ForegroundColor Yellow
$renderYamlPath = "render.yaml"
$renderYamlContent = Get-Content $renderYamlPath -Raw
$renderYamlContent = $renderYamlContent -replace "yourusername/murai-model-service:latest", $fullImageName
Set-Content -Path $renderYamlPath -Value $renderYamlContent

Write-Host "`nDocker image successfully built and pushed to Docker Hub!" -ForegroundColor Green
Write-Host "Image URL: $fullImageName" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Push your changes to GitHub" -ForegroundColor White
Write-Host "2. Deploy your service on Render using the updated render.yaml" -ForegroundColor White

Read-Host "`nPress Enter to exit"
