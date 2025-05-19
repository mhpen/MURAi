Write-Host "Building MURAi client for production..." -ForegroundColor Green

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "You can now deploy the 'dist' folder to Vercel or any other hosting service." -ForegroundColor Cyan

Read-Host "Press Enter to exit"
