Write-Host "Starting the dashboard with actual model metrics..." -ForegroundColor Green

Set-Location -Path client
npm run dev

Read-Host "Press Enter to exit"
