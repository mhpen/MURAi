import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { 
  getAnalytics, 
  getAnalyticsByDateRange, 
  getBubbleChartData 
} from '../controllers/analytics.controller.js';

const router = Router();

// Get overall analytics
router.get('/', [auth, isAdmin], getAnalytics);

// Get website-specific analytics
router.get('/website/:websiteId', [auth, isAdmin], getAnalytics);

// Get language analytics
router.get('/languages', [auth, isAdmin], async (req, res) => {
  // TODO: Implement get language analytics
});

// Get word category analytics
router.get('/categories', [auth, isAdmin], async (req, res) => {
  // TODO: Implement get category analytics
});

// Get analytics by date range
router.get('/date-range', [auth, isAdmin], getAnalyticsByDateRange);

// Get bubble chart data
router.get('/bubble-chart', auth, getBubbleChartData);

export default router; 