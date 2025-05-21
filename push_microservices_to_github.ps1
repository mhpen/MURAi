# Script to push MURAi microservices to GitHub

Write-Host "Preparing to push MURAi microservices to GitHub..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "Git is not installed or not in PATH. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# Navigate to microservices directory
Set-Location -Path "microservices"

# Check if .git directory exists
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init

    # Check if remote exists
    $remotes = git remote
    if ($remotes -notcontains "origin") {
        Write-Host "Adding remote origin..." -ForegroundColor Yellow

        # Use the provided GitHub repository URL
        git remote add origin "https://github.com/mhpen/murai-api.git"
    }
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
}

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = Read-Host "Enter commit message (default: 'Initial commit of microservices')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit of microservices"
}

Write-Host "Committing changes with message: $commitMessage" -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "Changes pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "Your microservices code should now be available at: https://github.com/mhpen/murai-api" -ForegroundColor Cyan
Write-Host "You can now deploy it to Render using the render.yaml configuration" -ForegroundColor Cyan

# Return to original directory
Set-Location -Path ".."

Read-Host "Press Enter to exit"
