# MURAi Client Deployment Guide

This guide provides instructions for deploying the MURAi client application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (can sign up with GitHub)
- Node.js and npm installed locally

## Deployment Steps

### Option 1: Automatic Deployment via GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. Log in to Vercel (https://vercel.com)

3. Click "Add New" > "Project"

4. Import your GitHub repository

5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: client
   - Build Command: npm run build
   - Output Directory: dist
   - Environment Variables: Add VITE_API_URL=https://murai-qgd8.onrender.com

6. Click "Deploy"

### Option 2: Manual Deployment

1. Build the application:
   ```bash
   cd client
   npm install
   npm run build
   ```

2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Deploy using Vercel CLI:
   ```bash
   vercel login
   vercel
   ```

4. Follow the prompts to configure your deployment

## Post-Deployment

After deployment, your application will be available at a URL provided by Vercel (e.g., https://murai.vercel.app).

## Troubleshooting

- If you encounter routing issues, ensure the vercel.json file is properly configured with rewrites
- For API connection issues, check that the VITE_API_URL environment variable is correctly set
- For build errors, check the Vercel deployment logs

## Updating the Deployment

Any changes pushed to the main branch will automatically trigger a new deployment if you've set up automatic deployments.

For manual updates:
```bash
npm run build
vercel --prod
```
