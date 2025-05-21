# MURAi Client Deployment Script
# This script builds and prepares the client for deployment to Vercel

Write-Host "Starting MURAi client deployment process..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Navigate to the client directory
$clientPath = $PSScriptRoot
Set-Location $clientPath

# Ensure we have the production .env file
Write-Host "Checking .env file for production settings..." -ForegroundColor Green
$envContent = Get-Content -Path ".env" -ErrorAction SilentlyContinue
if ($envContent -match "localhost") {
    Write-Host "Updating .env file with production settings..." -ForegroundColor Yellow
    Set-Content -Path ".env" -Value "VITE_API_URL=https://murai-qgd8.onrender.com"
    Write-Host ".env file updated for production" -ForegroundColor Green
} else {
    Write-Host ".env file already configured for production" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Build the application
Write-Host "Building application for production..." -ForegroundColor Green
npm run build

# Check if build was successful
if (Test-Path "dist") {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    
    # Instructions for manual deployment
    Write-Host "`nTo deploy to Vercel:" -ForegroundColor Cyan
    Write-Host "1. Install Vercel CLI: npm install -g vercel" -ForegroundColor White
    Write-Host "2. Login to Vercel: vercel login" -ForegroundColor White
    Write-Host "3. Deploy: vercel --prod" -ForegroundColor White
    Write-Host "`nOr deploy via the Vercel dashboard by uploading the dist folder." -ForegroundColor White
    
    # Open the dist folder
    Write-Host "`nOpening the dist folder..." -ForegroundColor Green
    Invoke-Item "dist"
} else {
    Write-Host "Build failed. Please check the error messages above." -ForegroundColor Red
}

Write-Host "`nDeployment preparation complete!" -ForegroundColor Cyan
Write-Host "Your application will be available at: https://murai.vercel.app" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
