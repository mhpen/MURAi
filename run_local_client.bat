@echo off
echo Starting MURAi Frontend Client...
echo.

REM Create or update .env file with local settings
echo Creating .env file with local settings...
echo VITE_API_URL=http://localhost:5001 > .env

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Run the client
echo Starting client on port 5173...
npm run dev
