# MURAi - Content Moderation Analytics System

## Overview

MURAi is a comprehensive content moderation analytics system designed to monitor, analyze, and provide insights into content moderation activities across different websites. The system provides detailed analytics about flagged content, moderation accuracy, language distribution, and sentiment analysis.

## System Architecture

### Client Application (React.js)
- Admin Dashboard with real-time analytics
- Overview and Detailed Analytics Views
- Interactive charts and visualizations
- Real-time content moderation monitoring
- Dark/Light mode support

### Server Application (Node.js/Express)
- RESTful API Endpoints
- Real-time data processing
- Analytics generation
- Caching system
- Authentication and authorization
- Model integration

## Features

- Multi-language support (Filipino and English)
- Sentiment analysis tracking
- Automated and user-reported content tracking
- Detailed analytics and reporting
- Website-specific analytics
- Performance metrics for moderation accuracy
- Time-series analysis of moderation activities

## Client-Side Components

### 1. Admin Dashboard
- Real-time overview of moderation activities
- Key performance indicators
- Quick action buttons
- Summary statistics

### 2. Analytics Overview
- Total flagged content metrics
- Language distribution charts
- Sentiment analysis breakdown
- Website source analysis
- Moderation accuracy metrics

### 3. Detailed Analytics
- Time-series data visualization
- Word frequency analysis
- Advanced filtering options
- Custom date range selection
- Export functionality

### 4. Model Performance Monitoring
- Model accuracy tracking
- Response time monitoring
- Confidence score analysis
- Model comparison tools

## Complete API Documentation

### Client-Side API Calls

#### Authentication
```javascript
// Login
api.post('/api/auth/login', { email, password })

// Logout
api.post('/api/auth/logout')
```

#### Analytics
```javascript
// Get Overview Analytics
api.get('/api/admin/analytics/overview')

// Get Detailed Analytics
api.get('/api/admin/analytics/detailed', { params: { timeRange, language } })
```

#### Model Management
```javascript
// Get Model Metrics
api.get('/api/model/metrics')

// Get Latest Model Metrics
api.get('/api/model/metrics/latest')

// Get Model Comparison
api.get('/api/model/metrics/comparison')

// Get Model Logs
api.get('/api/model/logs')

// Save Model Metrics
api.post('/api/model/metrics', metricsData)

// Save Model Log
api.post('/api/model/logs', logData)

// Retrain Model
api.post('/api/model/training/retrain', { model_type: modelType })

// Get Retraining Status
api.get('/api/model/training/status', { params: { model_type: modelType } })
```

#### Content Detection
```javascript
// Test Content Detection
api.post('/api/detection/test', { text, model })

// Save Test Metrics
api.post('/api/model/test-metrics', metrics)

// Get Test Metrics
api.get('/api/model/test-metrics')

// Get Test Metrics by Model
api.get('/api/model/test-metrics/${modelType}')

// Get Average Processing Time
api.get('/api/model/test-metrics/stats/average-time')
```

### Server-Side API Endpoints

#### Authentication Endpoints

##### 1. User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### User Management Endpoints

##### 1. Get User Profile
```http
GET /api/users/profile
```

**Authentication:** Required
**Response:**
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user",
  "created_at": "2024-03-20T00:00:00.000Z"
}
```

#### Analytics Endpoints

##### 1. Overview Analytics
```http
GET /api/admin/analytics/overview
```

**Authentication:** Admin Required
**Response:** [Previous overview response format]

##### 2. Detailed Analytics
```http
GET /api/admin/analytics/detailed
```

**Query Parameters:**
- `timeRange`: daily | weekly | monthly | yearly
- `language`: filipino | english | both

**Authentication:** Admin Required
**Response:** [Previous detailed response format]

#### Model Management Endpoints

##### 1. Model Metrics
```http
GET /api/model/metrics
```

**Authentication:** Admin Required
**Response:**
```json
{
  "accuracy": 0.95,
  "precision": 0.94,
  "recall": 0.93,
  "f1_score": 0.94,
  "processing_time_avg": 45,
  "last_updated": "2024-03-20T00:00:00.000Z"
}
```

#### Content Detection Endpoints

##### 1. Text Analysis
```http
POST /api/detection/text
```

**Request Body:**
```json
{
  "text": "Content to analyze",
  "model": "roberta"
}
```

**Response:**
```json
{
  "is_inappropriate": false,
  "confidence": 0.95,
  "processing_time_ms": 45,
  "model_used": "roberta"
}
```

#### System Management Endpoints

##### 1. System Health
```http
GET /api/system/health
```

**Authentication:** Admin Required
**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "memory_usage": {
    "total": 1000000000,
    "used": 500000000
  },
  "last_checked": "2024-03-20T00:00:00.000Z"
}
```

## Setup and Installation

### Client Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm start
```

### Server Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

## Environment Variables

### Client Environment Variables
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_VERSION=1.0.0
```

### Server Environment Variables
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
MODEL_SERVICE_URL=http://localhost:8000
MICROSERVICE_API_KEY=your_api_key
```

## Security Features

- JWT-based authentication
- Role-based access control
- API rate limiting
- Request validation
- Secure error handling
- CORS protection
- XSS prevention
- CSRF protection

## Caching System

- Cache duration: 5 minutes
- Cached endpoints:
  - Analytics overview
  - Website-specific analytics
- Cache invalidation on data updates
- Redis-based caching (optional)

## Error Handling

### Client-Side
- Error boundaries for component errors
- Network error handling
- Loading states
- Fallback UI components

### Server-Side
- Global error middleware
- Validation error handling
- Database error handling
- Custom error classes
- Detailed error logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.