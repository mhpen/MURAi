# Script to push MURAi client changes to GitHub

Write-Host "Preparing to push MURAi client changes to GitHub..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "Git is not installed or not in PATH. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = Read-Host "Enter commit message (default: 'Update client for production')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update client for production"
}

Write-Host "Committing changes with message: $commitMessage" -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Changes pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "Your changes should now be available at: https://github.com/mhpen/MURAi" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
