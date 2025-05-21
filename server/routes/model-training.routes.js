import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { retrainModel, getRetrainingStatus } from '../controllers/model-training.controller.js';

const router = Router();

// Retrain model - admin only
router.post('/retrain', [auth, isAdmin], retrainModel);

// Get retraining status - admin only
router.get('/status', [auth, isAdmin], getRetrainingStatus);

export default router;
