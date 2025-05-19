@echo off
echo Building MURAi client for production...

echo Installing dependencies...
call npm install

echo Building application...
call npm run build

echo Build completed successfully!
echo You can now deploy the 'dist' folder to Vercel or any other hosting service.

pause
