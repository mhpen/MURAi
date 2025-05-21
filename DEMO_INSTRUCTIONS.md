# MURAi System Demo Instructions

This document provides instructions for running the MURAi system locally for demonstration purposes.

## Prerequisites

- Windows with PowerShell
- Node.js (v18 or higher)
- MongoDB (Community Edition)
- Python 3.8+ with virtual environment setup for the model service

## Quick Start

For the fastest way to start the entire system, run the following PowerShell script:

```powershell
.\run_all_components.ps1
```

This script will:
1. Check and free required ports if needed
2. Start MongoDB (if installed locally)
3. Start the Tagalog Profanity Detector Model Service
4. Start the MURAi Server
5. Start the MURAi Client
6. Open the application in your default browser

## Individual Component Scripts

If you prefer to start components individually or troubleshoot specific parts, use these scripts:

### 1. Verify Admin User

Before running the system, you may want to verify that the admin user exists in the database:

```powershell
.\verify_admin.ps1
```

This script will check if the admin user exists and offer to create it if not found.

### 2. Run Model Service

To start only the Tagalog Profanity Detector Model Service:

```powershell
.\run_model_service.ps1
```

The model service will be available at http://localhost:8000

### 3. Run Server

To start only the MURAi Server:

```powershell
.\run_server.ps1
```

The server API will be available at http://localhost:5001

### 4. Run Client

To start only the MURAi Client:

```powershell
.\run_client.ps1
```

The client will be available at http://localhost:5173 (or another port if 5173 is in use)

## Stopping the System

To stop all running components:

```powershell
.\stop_all_components.ps1
```

This script will:
1. Stop the MURAi Client
2. Stop the MURAi Server
3. Stop the Tagalog Profanity Detector Model Service
4. Optionally stop MongoDB

## Admin Login Credentials

Use these credentials to log in to the admin dashboard:

- **Email**: admin@murai.com
- **Password**: admin123

## Troubleshooting

### Port Already in Use

If you see errors about ports being in use, you can manually free them:

```powershell
# Find process using a specific port (e.g., 5001)
netstat -ano | findstr :5001

# Kill the process by PID
taskkill /F /PID <PID>
```

### MongoDB Connection Issues

If the server can't connect to MongoDB:

1. Ensure MongoDB is installed and running
2. Check the connection string in the server's `.env` file
3. Try connecting manually: `mongosh mongodb://localhost:27017/murai`

### Model Service Issues

If the model service fails to start:

1. Ensure the RoBERTa virtual environment is properly set up
2. Check that all required Python packages are installed
3. Verify that the model files are available in the expected location

## Demo Flow

For an effective demonstration:

1. Start all components using `run_all_components.ps1`
2. Log in to the admin dashboard using the provided credentials
3. Navigate to the Model Dashboard to view model metrics
4. Use the Model Test page to demonstrate real-time profanity detection
5. Show the main dashboard with analytics and visualizations

## Additional Notes

- The logs for each component are saved in the `logs` directory
- The model service may take some time to initialize as it loads the models into memory
- For best performance, ensure your system has sufficient RAM (8GB+) and CPU resources
