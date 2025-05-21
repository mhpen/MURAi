@echo off
echo Starting Tagalog Profanity Detection Model Service...
echo.

REM Activate the virtual environment
call roberta_venv\Scripts\activate.bat

REM Set environment variables
set PORT=8000
set API_URL=http://localhost:5001
set MICROSERVICE_API_KEY=murai-microservice-api-key-2024
set MODEL_VERSION=v1.3.0
set PYTHONUNBUFFERED=1
set TRANSFORMERS_CACHE=./models

REM Run the simplified app
echo Running app_simple.py on port 8000...
python -m uvicorn app_simple:app --host 0.0.0.0 --port 8000 --reload

REM Deactivate the virtual environment when done
call deactivate
