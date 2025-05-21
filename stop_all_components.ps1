# MURAi System Shutdown Script
# This script stops all components of the MURAi system

Write-Host "Stopping MURAi System..." -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

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
        return $true
    }
    return $false
}

# Stop the client (Vite server)
Write-Host "Stopping MURAi Client..." -ForegroundColor Green
$clientStopped = $false
foreach ($port in @(5173, 5174, 5175, 5176)) {
    if (Kill-ProcessOnPort -Port $port) {
        $clientStopped = $true
    }
}

if ($clientStopped) {
    Write-Host "MURAi Client stopped successfully" -ForegroundColor Green
} else {
    Write-Host "MURAi Client was not running" -ForegroundColor Yellow
}

# Stop the server
Write-Host "Stopping MURAi Server..." -ForegroundColor Green
if (Kill-ProcessOnPort -Port 5001) {
    Write-Host "MURAi Server stopped successfully" -ForegroundColor Green
} else {
    Write-Host "MURAi Server was not running" -ForegroundColor Yellow
}

# Stop the model service
Write-Host "Stopping Tagalog Profanity Detector Model Service..." -ForegroundColor Green
if (Kill-ProcessOnPort -Port 8000) {
    Write-Host "Model Service stopped successfully" -ForegroundColor Green
} else {
    Write-Host "Model Service was not running" -ForegroundColor Yellow
}

# Ask if user wants to stop MongoDB
$stopMongo = Read-Host "Do you want to stop MongoDB as well? (y/n)"
if ($stopMongo -eq "y") {
    Write-Host "Stopping MongoDB..." -ForegroundColor Green
    try {
        # Find MongoDB process
        $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
        if ($mongoProcess) {
            $mongoProcess | Stop-Process -Force
            Write-Host "MongoDB stopped successfully" -ForegroundColor Green
        } else {
            Write-Host "MongoDB process not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Failed to stop MongoDB: $_" -ForegroundColor Red
    }
}

Write-Host "`nAll MURAi components have been stopped!" -ForegroundColor Cyan
