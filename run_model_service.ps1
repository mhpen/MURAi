# MURAi Tagalog Profanity Detector Model Service Startup Script

Write-Host "Starting Tagalog Profanity Detection Model Service..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port\s+.*LISTENING"
    return $connections.Count -gt 0
}

# Function to kill a process using a specific port
function Kill-ProcessOnPort {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port\s+.*LISTENING"
    if ($connections.Count -gt 0) {
        $processId = $connections[0].ToString().Split(' ')[-1]
        Write-Host "Killing process with ID $processId on port $Port" -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
    }
}

# Check and kill processes on port 8000 if needed
if (Test-PortInUse -Port 8000) {
    Write-Host "Port 8000 is in use. Attempting to free it..." -ForegroundColor Yellow
    Kill-ProcessOnPort -Port 8000
    Start-Sleep -Seconds 2
}

# Navigate to the model service directory
$modelServicePath = Join-Path $PSScriptRoot "microservices\tagalog_profanity_detector"
Set-Location $modelServicePath

# Set environment variables
$env:PORT = 8000
$env:API_URL = "http://localhost:5001"
$env:MICROSERVICE_API_KEY = "murai-microservice-api-key-2024"
$env:MODEL_VERSION = "v1.3.0"
$env:PYTHONUNBUFFERED = 1
$env:TRANSFORMERS_CACHE = "./models"

# Check if the virtual environment exists
if (Test-Path "roberta_venv\Scripts\Activate.ps1") {
    # Activate the virtual environment
    Write-Host "Activating RoBERTa virtual environment..." -ForegroundColor Green
    & "roberta_venv\Scripts\Activate.ps1"
    
    # Run the model service
    Write-Host "Starting model service on port 8000..." -ForegroundColor Green
    python app.py
} else {
    Write-Host "RoBERTa virtual environment not found!" -ForegroundColor Red
    Write-Host "Please make sure you have set up the virtual environment correctly." -ForegroundColor Red
    Write-Host "You may need to create it using: python -m venv roberta_venv" -ForegroundColor Yellow
    Write-Host "Then install dependencies: roberta_venv\Scripts\pip install -r requirements.txt" -ForegroundColor Yellow
    
    # Pause to keep the window open
    Read-Host "Press Enter to exit"
}
