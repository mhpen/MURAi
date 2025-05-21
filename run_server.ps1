# MURAi Server Startup Script

Write-Host "Starting MURAi Backend Server..." -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

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

# Check and kill processes on port 5001 if needed
if (Test-PortInUse -Port 5001) {
    Write-Host "Port 5001 is in use. Attempting to free it..." -ForegroundColor Yellow
    Kill-ProcessOnPort -Port 5001
    Start-Sleep -Seconds 2
}

# Navigate to the server directory
$serverPath = Join-Path $PSScriptRoot "server"
Set-Location $serverPath

# Set environment variables
$env:PORT = 5001
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5175"
$env:APP_URL = "http://localhost:5001"
$env:MODEL_SERVICE_URL = "http://localhost:8000"
$env:MICROSERVICE_API_KEY = "murai-microservice-api-key-2024"
$env:JWT_SECRET = "local-development-jwt-secret-key-2024"

# Check if MongoDB is running
Write-Host "Checking if MongoDB is running..." -ForegroundColor Green
$mongoRunning = $false
try {
    $mongoStatus = mongosh --eval "db.version()" 2>&1
    if ($mongoStatus -match "MongoDB server version") {
        Write-Host "MongoDB is running" -ForegroundColor Green
        $mongoRunning = $true
    }
} catch {
    Write-Host "MongoDB is not running" -ForegroundColor Yellow
}

if (-not $mongoRunning) {
    Write-Host "MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "You can download MongoDB Community Edition from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    
    # Ask if user wants to continue anyway
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Check if the .env file exists, create it if not
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5175
APP_URL=http://localhost:5001
MODEL_SERVICE_URL=http://localhost:8000/
MICROSERVICE_API_KEY=murai-microservice-api-key-2024
JWT_SECRET=local-development-jwt-secret-key-2024
MONGODB_URI=mongodb://localhost:27017/murai
"@
    Set-Content -Path ".env" -Value $envContent
    Write-Host ".env file created" -ForegroundColor Green
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting server on port 5001..." -ForegroundColor Green
npm run dev
