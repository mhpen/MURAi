# MURAi Admin Verification Script

Write-Host "Verifying MURAi Admin User..." -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Navigate to the server directory
$serverPath = Join-Path $PSScriptRoot "server"
Set-Location $serverPath

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
    Write-Host "MongoDB is not running" -ForegroundColor Red
    Write-Host "Please start MongoDB first." -ForegroundColor Red
    Write-Host "You can download MongoDB Community Edition from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit
}

# Run the verify admin script
Write-Host "Running verify-admin script..." -ForegroundColor Green
npm run verify-admin

# Ask if user wants to create admin if not found
$createAdmin = Read-Host "Do you want to create/reset the admin user? (y/n)"
if ($createAdmin -eq "y") {
    Write-Host "Creating admin user..." -ForegroundColor Green
    npm run force-admin
    
    # Display admin credentials
    Write-Host "`nAdmin Login Credentials:" -ForegroundColor Cyan
    Write-Host "Email: admin@murai.com" -ForegroundColor White
    Write-Host "Password: admin123" -ForegroundColor White
}

Write-Host "`nVerification complete!" -ForegroundColor Green
