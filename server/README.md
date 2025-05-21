# MURAi Server

This is the server component of the MURAi Tagalog Profanity Detection System. It provides RESTful APIs for profanity detection, user management, analytics, and integration with the machine learning model service.

## Features

- User authentication and authorization
- Admin dashboard data APIs
- Profanity detection endpoints
- Analytics and reporting
- Integration with RoBERTa Tagalog model microservice

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Axios for HTTP requests

## Prerequisites

- Node.js 18 or higher
- MongoDB database (local or Atlas)
- Access to the MURAi model microservice

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://murai.vercel.app
APP_URL=https://murai-qgd8.onrender.com
MICROSERVICE_API_KEY=your_microservice_api_key
MODEL_SERVICE_URL=https://murai-model-service.onrender.com
```

## Installation

```bash
# Install dependencies
npm install

# Start the server in development mode
npm run dev

# Start the server in production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Admin
- `GET /api/admin/analytics/overview` - Get admin dashboard overview
- `GET /api/admin/analytics/detailed` - Get detailed analytics

### Detection
- `POST /api/detection/analyze` - Analyze text for profanity
- `GET /api/detection/history` - Get detection history

### Model
- `GET /api/model/metrics` - Get model performance metrics
- `POST /api/model/test` - Test the model with custom input
- `POST /api/model/training` - Trigger model retraining

## Utility Scripts

- `npm run create-admin` - Create an admin user
- `npm run generate-data` - Generate sample data
- `npm run generate-metrics` - Generate model metrics
- `npm run setup` - Run all setup scripts
- `npm run verify-admin` - Verify admin user exists
- `npm run force-admin` - Force create admin user

## Deployment

The server is deployed on Render at [https://murai-qgd8.onrender.com](https://murai-qgd8.onrender.com).

## License

This project is proprietary and confidential.
