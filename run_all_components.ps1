# MURAi System Startup Script
# This script starts all components of the MURAi system in the correct order
param(
    [switch]$Production
)

Write-Host "Starting MURAi System..." -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )

    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port\s+.*LISTENING"
    return $connections.Count -gt 0
}

# Function to stop a process using a specific port
function Stop-ProcessOnPort {
    param (
        [int]$Port
    )

    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port\s+.*LISTENING"
    if ($connections.Count -gt 0) {
        $processId = $connections[0].ToString().Split(' ')[-1]
        Write-Host "Stopping process with ID $processId on port $Port" -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
    }
}

# Check and stop processes on required ports
$requiredPorts = @(5001, 8000, 5173, 5174, 5175)
foreach ($port in $requiredPorts) {
    if (Test-PortInUse -Port $port) {
        Write-Host "Port $port is in use. Attempting to free it..." -ForegroundColor Yellow
        Stop-ProcessOnPort -Port $port
        Start-Sleep -Seconds 2
    }
}

# Create a new directory for logs if it doesn't exist
if (-not (Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Set environment variables
if ($Production) {
    Write-Host "Running in PRODUCTION mode" -ForegroundColor Red
    $env:NODE_ENV = "production"
    $env:FRONTEND_URL = "https://murai.vercel.app"
    $env:APP_URL = "https://murai-qgd8.onrender.com"
    $env:MODEL_SERVICE_URL = "https://murai-model-api-service.onrender.com"
    $env:MICROSERVICE_API_KEY = "murai-microservice-api-key-2024"
} else {
    Write-Host "Running in DEVELOPMENT mode" -ForegroundColor Green
    $env:NODE_ENV = "development"
    $env:FRONTEND_URL = "http://localhost:5175"
    $env:APP_URL = "http://localhost:5001"
    $env:MODEL_SERVICE_URL = "http://localhost:8000"
    $env:MICROSERVICE_API_KEY = "murai-microservice-api-key-2024"
}

# 1. Start MongoDB (if installed locally)
Write-Host "Checking MongoDB status..." -ForegroundColor Green
$mongoRunning = $false
try {
    $mongoStatus = mongosh --eval "db.version()" 2>&1
    if ($mongoStatus -match "MongoDB server version") {
        Write-Host "MongoDB is already running" -ForegroundColor Green
        $mongoRunning = $true
    }
} catch {
    Write-Host "MongoDB is not running" -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    Write-Host "Attempting to start MongoDB..." -ForegroundColor Yellow
    try {
        Start-Process "mongod" -ArgumentList "--dbpath=data/db" -WindowStyle Hidden
        Write-Host "MongoDB started successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to start MongoDB. Please start it manually." -ForegroundColor Red
        Write-Host "You can download MongoDB Community Edition from https://www.mongodb.com/try/download/community" -ForegroundColor Red
    }
}

# 2. Start the Tagalog Profanity Detector Model Service
Write-Host "`nStarting Tagalog Profanity Detector Model Service..." -ForegroundColor Green
$modelServicePath = Join-Path $PSScriptRoot "microservices\tagalog_profanity_detector"
$modelServiceLogPath = Join-Path $PSScriptRoot "logs\model_service.log"

Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"
    cd '$modelServicePath'
    if (Test-Path 'roberta_venv\Scripts\Activate.ps1') {
        & 'roberta_venv\Scripts\Activate.ps1'
        python app.py | Tee-Object -FilePath '$modelServiceLogPath'
    } else {
        Write-Host 'RoBERTa virtual environment not found. Please set it up first.' -ForegroundColor Red
    }
`"" -WindowStyle Normal

# Wait for model service to start
Write-Host "Waiting for model service to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 3. Start the Server
Write-Host "`nStarting MURAi Server..." -ForegroundColor Green
$serverPath = Join-Path $PSScriptRoot "server"
$serverLogPath = Join-Path $PSScriptRoot "logs\server.log"

Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"
    cd '$serverPath'
    npm run dev | Tee-Object -FilePath '$serverLogPath'
`"" -WindowStyle Normal

# Wait for server to start
Write-Host "Waiting for server to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 4. Start the Client
Write-Host "`nStarting MURAi Client..." -ForegroundColor Green
$clientPath = Join-Path $PSScriptRoot "client"
$clientLogPath = Join-Path $PSScriptRoot "logs\client.log"

# Create or update .env file with appropriate settings
if ($Production) {
    $envContent = "VITE_API_URL=https://murai-qgd8.onrender.com"
} else {
    $envContent = "VITE_API_URL=http://localhost:5001"
}
Set-Content -Path (Join-Path $clientPath ".env") -Value $envContent

Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"
    cd '$clientPath'
    npm run dev | Tee-Object -FilePath '$clientLogPath'
`"" -WindowStyle Normal

# Wait for client to start
Write-Host "Waiting for client to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open the application in the default browser
Write-Host "`nOpening MURAi in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5175"

# Display admin credentials
Write-Host "`nAdmin Login Credentials:" -ForegroundColor Cyan
Write-Host "Email: admin@murai.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White

Write-Host "`nAll MURAi components are now running!" -ForegroundColor Cyan
Write-Host "- Model Service: http://localhost:8000" -ForegroundColor White
Write-Host "- Server API: http://localhost:5001" -ForegroundColor White
Write-Host "- Client: http://localhost:5175" -ForegroundColor White
Write-Host "`nLog files are being saved in the logs directory." -ForegroundColor White
Write-Host "`nPress Ctrl+C in each terminal window to stop the services when you're done." -ForegroundColor Yellow
