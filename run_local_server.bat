@echo off
echo Starting MURAi Backend Server...
echo.

REM Set environment variables
set PORT=5001
set NODE_ENV=development
set FRONTEND_URL=http://localhost:5173
set APP_URL=http://localhost:5001
set MODEL_SERVICE_URL=http://localhost:8000
set MICROSERVICE_API_KEY=murai-microservice-api-key-2024
set JWT_SECRET=local-development-jwt-secret-key-2024
set MONGODB_URI=mongodb://localhost:27017/murai

REM Check if MongoDB is running
echo Checking if MongoDB is running...
mongosh --eval "db.version()" > nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    echo You can download MongoDB Community Edition from https://www.mongodb.com/try/download/community
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Run the server
echo Starting server on port 5001...
npm run dev
