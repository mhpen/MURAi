# MURAi Production Preparation Script
# This script prepares the MURAi system for production deployment

Write-Host "Preparing MURAi System for Production Deployment..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to check if a file exists
function Test-FileExists {
    param (
        [string]$Path
    )
    
    return Test-Path -Path $Path
}

# Function to backup a file
function Backup-File {
    param (
        [string]$Path
    )
    
    if (Test-FileExists -Path $Path) {
        $backupPath = "$Path.bak"
        Copy-Item -Path $Path -Destination $backupPath -Force
        Write-Host "Backed up $Path to $backupPath" -ForegroundColor Green
    }
}

# Create backups directory if it doesn't exist
if (-not (Test-Path -Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
    Write-Host "Created backups directory" -ForegroundColor Green
}

# Backup current environment files
Write-Host "`nBacking up current environment files..." -ForegroundColor Yellow
Backup-File -Path ".env"
Backup-File -Path "client/.env"
Backup-File -Path "server/.env"
Backup-File -Path "microservices/tagalog_profanity_detector/.env"

# Update root .env file
Write-Host "`nUpdating root .env file..." -ForegroundColor Yellow
$rootEnvContent = "VITE_API_URL=https://murai-qgd8.onrender.com"
Set-Content -Path ".env" -Value $rootEnvContent
Write-Host "Root .env file updated for production" -ForegroundColor Green

# Update client .env file
Write-Host "`nUpdating client .env file..." -ForegroundColor Yellow
$clientEnvContent = "VITE_API_URL=https://murai-qgd8.onrender.com"
Set-Content -Path "client/.env" -Value $clientEnvContent
Write-Host "Client .env file updated for production" -ForegroundColor Green

# Update server .env file
Write-Host "`nUpdating server .env file..." -ForegroundColor Yellow
$serverEnvPath = "server/.env"
if (Test-FileExists -Path $serverEnvPath) {
    $serverEnvContent = Get-Content -Path $serverEnvPath -Raw
    $serverEnvContent = $serverEnvContent -replace "NODE_ENV=development", "NODE_ENV=production"
    $serverEnvContent = $serverEnvContent -replace "MODEL_SERVICE_URL=http://localhost:8000/", "MODEL_SERVICE_URL=https://murai-model-api-service.onrender.com"
    Set-Content -Path $serverEnvPath -Value $serverEnvContent
    Write-Host "Server .env file updated for production" -ForegroundColor Green
} else {
    Write-Host "Server .env file not found. Creating new one..." -ForegroundColor Yellow
    $serverEnvContent = @"
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://murai.vercel.app
APP_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=murai-microservice-api-key-2024
MODEL_SERVICE_URL=https://murai-model-api-service.onrender.com
"@
    Set-Content -Path $serverEnvPath -Value $serverEnvContent
    Write-Host "Server .env file created for production" -ForegroundColor Green
    Write-Host "IMPORTANT: Update the MongoDB URI and JWT Secret with your actual values" -ForegroundColor Red
}

# Update microservice .env file
Write-Host "`nUpdating microservice .env file..." -ForegroundColor Yellow
$microserviceEnvPath = "microservices/tagalog_profanity_detector/.env"
if (Test-FileExists -Path $microserviceEnvPath) {
    $microserviceEnvContent = @"
API_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=murai-microservice-api-key-2024
MODEL_VERSION=v1.3.0
PORT=8000
PYTHONUNBUFFERED=1
TRANSFORMERS_CACHE=./models
"@
    Set-Content -Path $microserviceEnvPath -Value $microserviceEnvContent
    Write-Host "Microservice .env file updated for production" -ForegroundColor Green
} else {
    Write-Host "Microservice .env file not found. Creating new one..." -ForegroundColor Yellow
    $microserviceEnvContent = @"
API_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=murai-microservice-api-key-2024
MODEL_VERSION=v1.3.0
PORT=8000
PYTHONUNBUFFERED=1
TRANSFORMERS_CACHE=./models
"@
    Set-Content -Path $microserviceEnvPath -Value $microserviceEnvContent
    Write-Host "Microservice .env file created for production" -ForegroundColor Green
}

# Build client for production
Write-Host "`nBuilding client for production..." -ForegroundColor Yellow
Set-Location -Path "client"
npm install
npm run build
Set-Location -Path ".."
Write-Host "Client built for production" -ForegroundColor Green

# Check for sensitive information in code
Write-Host "`nChecking for sensitive information in code..." -ForegroundColor Yellow
$sensitivePatterns = @(
    "password",
    "secret",
    "api[_\s-]?key",
    "token",
    "mongodb[+:]",
    "mongodb+srv"
)

$filesToCheck = Get-ChildItem -Path "." -Recurse -Include "*.js", "*.jsx", "*.ts", "*.tsx", "*.py", "*.json", "*.md", "*.ps1", "*.bat" -Exclude "node_modules", "dist", "build", "**/venv/**", "**/__pycache__/**"

$sensitiveFilesFound = $false
foreach ($file in $filesToCheck) {
    $content = Get-Content -Path $file.FullName -Raw
    foreach ($pattern in $sensitivePatterns) {
        if ($content -match $pattern) {
            if (-not $sensitiveFilesFound) {
                Write-Host "Potential sensitive information found in the following files:" -ForegroundColor Red
                $sensitiveFilesFound = $true
            }
            Write-Host "  - $($file.FullName)" -ForegroundColor Red
            break
        }
    }
}

if (-not $sensitiveFilesFound) {
    Write-Host "No obvious sensitive information found in code files" -ForegroundColor Green
} else {
    Write-Host "Please review the above files for sensitive information before pushing to GitHub" -ForegroundColor Red
}

Write-Host "`nMURAi system is now prepared for production deployment!" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Review any files with potential sensitive information" -ForegroundColor White
Write-Host "2. Push your code to GitHub using the push_to_github.ps1 script" -ForegroundColor White
Write-Host "3. Deploy your application using the deployment instructions" -ForegroundColor White
