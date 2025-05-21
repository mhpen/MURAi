# Deploying MURAi Microservices to Render with Docker

This guide explains how to deploy the MURAi microservices to Render using Docker after pushing the code to GitHub.

## Prerequisites

- GitHub repository with the microservices code (https://github.com/mhpen/murai-api)
- Render account (https://render.com)

## Deployment Steps

### 1. Push Code to GitHub

First, make sure your code is pushed to GitHub using the `push_microservices_to_github.ps1` script.

### 2. Sign in to Render

1. Go to [Render](https://render.com) and sign in with your account
2. If you don't have an account, create one by signing up with GitHub

### 3. Create a New Web Service

1. From your Render dashboard, click on the "New +" button
2. Select "Web Service" from the dropdown menu

### 4. Connect Your GitHub Repository

1. Connect your GitHub account if you haven't already
2. Select the repository `mhpen/murai-api`
3. You might need to configure GitHub permissions to allow Render to access the repository

### 5. Configure the Docker Web Service

1. Name: `murai-model-service`
2. Environment: `Docker`
3. Region: Select a region close to your users (e.g., Singapore)
4. Branch: `main`
5. Root Directory: `tagalog_profanity_detector` (since the microservice is in this subdirectory)
6. Docker Build Context: `.` (the current directory)
7. Dockerfile Path: `./Dockerfile` (the path to your Dockerfile)
8. Plan: Free (or select a paid plan for production)

### 6. Configure Environment Variables

Add the following environment variables:

- `API_URL`: `https://murai-qgd8.onrender.com`
- `MICROSERVICE_API_KEY`: `murai-microservice-api-key-2024`
- `MODEL_VERSION`: `v1.3.0`
- `PORT`: `8000`
- `PYTHONUNBUFFERED`: `1`
- `TRANSFORMERS_CACHE`: `/app/models`

### 7. Deploy the Service

1. Click "Create Web Service"
2. Render will automatically build the Docker image and deploy your service
3. The deployment process may take several minutes, especially for the first build as it needs to download and cache the RoBERTa model

### 8. Verify the Deployment

1. Once deployed, Render will provide a URL for your service (e.g., `https://murai-model-service.onrender.com`)
2. Test the service by accessing the health endpoint: `https://murai-model-service.onrender.com/health`
3. You should see a JSON response with the status of the service

### 9. Update the Server Configuration

After successful deployment, update the `MODEL_SERVICE_URL` environment variable in your main server to point to the new microservice URL:

```
MODEL_SERVICE_URL=https://murai-model-service.onrender.com
```

## Local Docker Testing

Before deploying to Render, you can test your Docker container locally:

1. **Build the Docker image**:
   ```powershell
   docker build -t murai-model-service -f Dockerfile.render .
   ```

2. **Run the Docker container locally**:
   ```powershell
   docker run -p 8000:8000 \
     -e API_URL=https://murai-qgd8.onrender.com \
     -e MICROSERVICE_API_KEY=murai-microservice-api-key-2024 \
     -e MODEL_VERSION=v1.3.0 \
     -e PORT=8000 \
     -e PYTHONUNBUFFERED=1 \
     -e TRANSFORMERS_CACHE=/app/models \
     murai-model-service
   ```

3. **Test the local deployment**:
   - Open your browser and go to `http://localhost:8000/health`
   - You should see a JSON response with the status of the service

## Docker Hub Deployment (Recommended)

If you encounter image size limitations on Render, you can use Docker Hub:

1. **Build and push the Docker image to Docker Hub**:
   ```powershell
   # Run the provided script
   .\build_and_push_docker.ps1
   ```

2. **The script will**:
   - Build the Docker image using Dockerfile.render
   - Tag the image with your Docker Hub username
   - Log you in to Docker Hub
   - Push the image to Docker Hub
   - Update render.yaml with the correct image URL

3. **Push the updated code to GitHub**:
   - Use the push_microservices_to_github.ps1 script

4. **Deploy on Render**:
   - Render will pull the image from Docker Hub instead of building it
   - This bypasses Render's image size limitations

## Docker Security Best Practices

When working with Docker, follow these security best practices:

1. **Never include sensitive data in Dockerfiles**:
   - Don't use ENV instructions for API keys, passwords, or other secrets
   - Pass sensitive data as environment variables at runtime
   - Use secrets management solutions for production deployments

2. **Use specific image versions**:
   - Avoid using `latest` tags for base images
   - Specify exact versions to ensure reproducibility

3. **Minimize image size**:
   - Use multi-stage builds when possible
   - Remove unnecessary packages and files
   - Use .dockerignore to exclude unnecessary files

4. **Run containers with least privilege**:
   - Avoid running containers as root
   - Use read-only file systems where possible
   - Limit container capabilities

## Docker Deployment Benefits

Using Docker for deployment provides several advantages:

1. **Consistency**: The same container runs in development and production
2. **Isolation**: Dependencies are isolated from the host system
3. **Reproducibility**: Builds are consistent and reproducible
4. **Scalability**: Easier to scale horizontally if needed
5. **Portability**: Can be deployed to any platform that supports Docker

## Troubleshooting Docker Deployments

### Image Size Issues

If you encounter the error "This Docker image's compressed size is larger than the allowed limit":

1. **Use the optimized Dockerfile.render**:
   - We've created a minimal Dockerfile.render specifically for Render deployment
   - It uses a simplified app_simple.py that loads models on demand
   - Make sure render.yaml points to Dockerfile.render

2. **Use CPU-only PyTorch**:
   - The requirements.txt file has been updated to use the CPU-only version of PyTorch
   - This significantly reduces the image size

3. **Minimize dependencies**:
   - Only include essential dependencies in requirements.txt
   - Remove large packages that aren't strictly necessary

4. **On-demand model loading**:
   - The simplified app loads models only when needed
   - This reduces the initial container size

### Build Failures

If the Docker build fails:
1. Check the build logs in the Render dashboard
2. Verify that all dependencies are correctly specified in requirements.txt
3. Make sure the Dockerfile is correctly formatted

### Container Startup Issues

If the container starts but the service doesn't work:
1. Check the container logs in the Render dashboard
2. Verify that the correct command is being used to start the application
3. Check that all required environment variables are set

### Model Loading Issues

If the models fail to load:
1. Check if there's enough memory allocated to the container
2. Verify that the model is being downloaded correctly during runtime
3. Check the TRANSFORMERS_CACHE environment variable is set correctly

### Connection Issues

If the main server cannot connect to the microservice, verify that:
1. The microservice is running (check the health endpoint)
2. The `MODEL_SERVICE_URL` in the main server is correct
3. The `MICROSERVICE_API_KEY` values match between the server and microservice

## Monitoring and Scaling

- Monitor the performance of your Docker container in the Render dashboard
- Upgrade to a paid plan if you need more resources or higher availability
- Set up alerts for service outages or high resource usage
