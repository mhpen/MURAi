import { Router } from 'express';
import websiteRoutes from './website.routes.js';
import userRoutes from './user.routes.js';
import detectionRoutes from './detection.routes.js';
import reportRoutes from './report.routes.js';
import analyticsRoutes from './analytics.routes.js';
import modelRoutes from './model.routes.js';
import systemRoutes from './system.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Core routes
router.use('/websites', websiteRoutes);
router.use('/users', userRoutes);
router.use('/detection', detectionRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/model', modelRoutes);
router.use('/system', systemRoutes);
router.use('/admin', adminRoutes);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

export default router; 