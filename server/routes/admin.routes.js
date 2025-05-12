import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { 
  getAdminOverview,
  getDetailedAnalytics 
} from '../controllers/admin/AdminAnalyticsController.js';

const router = express.Router();

// Add error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Analytics routes
router.get('/analytics/overview', auth, isAdmin, getAdminOverview);
router.get('/analytics/detailed', auth, isAdmin, getDetailedAnalytics);

// Add a test route to verify the endpoint is working
router.get('/test', [auth, isAdmin], (req, res) => {
  res.json({ message: 'Admin routes are working' });
});

export default router; 