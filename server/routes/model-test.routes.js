import { Router } from 'express';
import { 
  saveTestMetrics, 
  getTestMetrics, 
  getTestMetricsByModel, 
  getAverageProcessingTime 
} from '../controllers/model-test.controller.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = Router();

// Save test metrics - public endpoint for the test page
router.post('/', saveTestMetrics);

// Get all test metrics - admin only
router.get('/', [auth, isAdmin], getTestMetrics);

// Get test metrics by model type - admin only
router.get('/:model_type', [auth, isAdmin], getTestMetricsByModel);

// Get average processing time by model - admin only
router.get('/stats/average-time', [auth, isAdmin], getAverageProcessingTime);

export default router;
