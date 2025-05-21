# MURAi GitHub Preparation Script
# This script prepares the MURAi system for pushing to GitHub

Write-Host "Preparing MURAi System for GitHub..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

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
Backup-File -Path "server/.env"
Backup-File -Path "client/.env"
Backup-File -Path "microservices/tagalog_profanity_detector/.env"

# Update server .env file for GitHub
Write-Host "`nUpdating server .env file for GitHub..." -ForegroundColor Yellow
$serverEnvPath = "server/.env"
if (Test-FileExists -Path $serverEnvPath) {
    $serverEnvContent = @"
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://murai.vercel.app
APP_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=your_microservice_api_key
MODEL_SERVICE_URL=https://murai-model-api-service.onrender.com
ADMIN_PASSWORD=secure_admin_password_for_production
"@
    Set-Content -Path $serverEnvPath -Value $serverEnvContent
    Write-Host "Server .env file updated for GitHub" -ForegroundColor Green
}

# Update client .env file for GitHub
Write-Host "`nUpdating client .env file for GitHub..." -ForegroundColor Yellow
$clientEnvPath = "client/.env"
if (Test-FileExists -Path $clientEnvPath) {
    $clientEnvContent = "VITE_API_URL=https://murai-qgd8.onrender.com"
    Set-Content -Path $clientEnvPath -Value $clientEnvContent
    Write-Host "Client .env file updated for GitHub" -ForegroundColor Green
}

# Update microservice .env file for GitHub
Write-Host "`nUpdating microservice .env file for GitHub..." -ForegroundColor Yellow
$microserviceEnvPath = "microservices/tagalog_profanity_detector/.env"
if (Test-FileExists -Path $microserviceEnvPath) {
    $microserviceEnvContent = @"
API_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=your_microservice_api_key
MODEL_VERSION=v1.3.0
PORT=8000
PYTHONUNBUFFERED=1
TRANSFORMERS_CACHE=./models
"@
    Set-Content -Path $microserviceEnvPath -Value $microserviceEnvContent
    Write-Host "Microservice .env file updated for GitHub" -ForegroundColor Green
}

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

Write-Host "`nMURAi system is now prepared for GitHub!" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Review any files with potential sensitive information" -ForegroundColor White
Write-Host "2. Push your code to GitHub using the appropriate script:" -ForegroundColor White
Write-Host "   - For server: .\push_server_to_github.ps1" -ForegroundColor White
Write-Host "   - For client: .\push_to_github.ps1" -ForegroundColor White
Write-Host "   - For microservices: .\push_microservices_to_github.ps1" -ForegroundColor White
