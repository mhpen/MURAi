import { Router } from 'express';
import { auth, isModerator } from '../middleware/auth.js';

const router = Router();

// Create report
router.post('/', auth, async (req, res) => {
  // TODO: Implement create report
});

// Get all reports
router.get('/', [auth, isModerator], async (req, res) => {
  // TODO: Implement get all reports
});

// Get single report
router.get('/:id', [auth, isModerator], async (req, res) => {
  // TODO: Implement get single report
});

// Update report status
router.put('/:id/status', [auth, isModerator], async (req, res) => {
  // TODO: Implement update report status
});

export default router; 