# MURAi Client Startup Script

Write-Host "Starting MURAi Frontend Client..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

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

# Check and kill processes on common Vite ports if needed
$vitePorts = @(5173, 5174, 5175)
foreach ($port in $vitePorts) {
    if (Test-PortInUse -Port $port) {
        Write-Host "Port $port is in use. Attempting to free it..." -ForegroundColor Yellow
        Kill-ProcessOnPort -Port $port
        Start-Sleep -Seconds 1
    }
}

# Navigate to the client directory
$clientPath = Join-Path $PSScriptRoot "client"
Set-Location $clientPath

# Create or update .env file with local settings
Write-Host "Creating .env file with local settings..." -ForegroundColor Green
$envContent = "VITE_API_URL=http://localhost:5001"
Set-Content -Path ".env" -Value $envContent

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the client
Write-Host "Starting client..." -ForegroundColor Green
Write-Host "The client will be available at http://localhost:5173 (or another port if 5173 is in use)" -ForegroundColor Green
npm run dev

# Display admin credentials
Write-Host "`nAdmin Login Credentials:" -ForegroundColor Cyan
Write-Host "Email: admin@murai.com" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
