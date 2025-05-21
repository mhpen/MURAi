import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {
  getModelMetrics,
  getLatestModelMetrics,
  saveModelMetrics,
  getModelLogs,
  saveModelLog,
  getModelComparison
} from '../controllers/model.controller.js';

const router = Router();

// Get all model metrics
router.get('/metrics', [auth, isAdmin], getModelMetrics);

// Get latest model metrics
router.get('/metrics/latest', [auth, isAdmin], getLatestModelMetrics);

// Get model comparison metrics
router.get('/metrics/comparison', [auth, isAdmin], getModelComparison);

// Save new model metrics
router.post('/metrics', [auth, isAdmin], saveModelMetrics);

// Get model logs
router.get('/logs', [auth, isAdmin], getModelLogs);

// Save model log
router.post('/logs', [auth, isAdmin], saveModelLog);

// Public endpoint for microservices to save metrics (secured by API key)
router.post('/metrics/microservice', async (req, res, next) => {
  // Simple API key validation - in production, use a more secure method
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MICROSERVICE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, saveModelMetrics);

export default router;