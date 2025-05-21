# MURAi Server Deployment Guide

This guide provides instructions for deploying the MURAi server to Render.

## Prerequisites

- GitHub account
- Render account (can sign up with GitHub)
- MongoDB Atlas account for database hosting

## Deployment Steps

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for development or specific IPs for production
5. Get your MongoDB connection string

### 2. Push Code to GitHub

1. Create a new repository on GitHub (e.g., `mhpen/MURAi-server`)
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/mhpen/MURAi-server.git
   git push -u origin main
   ```

### 3. Deploy to Render

1. Sign up for Render (https://render.com) using your GitHub account
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: murai-server
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or select a paid plan for production)

5. Add environment variables:
   - `PORT`: 5001 (Render will override this with its own PORT)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: production
   - `FRONTEND_URL`: https://murai.vercel.app
   - `APP_URL`: The URL of your Render service (will be available after creation)
   - `MICROSERVICE_API_KEY`: Your microservice API key
   - `MODEL_SERVICE_URL`: URL of your model microservice

6. Click "Create Web Service"

### 4. Post-Deployment Setup

After deployment is complete:

1. Update the `APP_URL` environment variable with the actual URL of your Render service
2. Create an admin user by running the setup script:
   - Go to the Render dashboard
   - Select your service
   - Go to "Shell"
   - Run: `npm run create-admin`

3. Test the API endpoints to ensure everything is working correctly

### 5. Continuous Deployment

Render automatically deploys new changes when you push to your GitHub repository. To update your deployment:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update server code"
   git push origin main
   ```

3. Render will automatically deploy the new changes

## Troubleshooting

- **Database Connection Issues**: Verify your MongoDB connection string and ensure IP whitelist includes Render's IPs
- **Environment Variables**: Check that all required environment variables are set correctly
- **Logs**: Check the Render logs for any errors during build or runtime
- **Memory/CPU Issues**: Consider upgrading to a paid plan if you're experiencing performance issues

## Monitoring

- Use Render's built-in monitoring tools to track your service's performance
- Consider implementing a more robust monitoring solution for production environments
