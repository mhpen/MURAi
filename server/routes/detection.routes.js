import { Router } from 'express';
import { auth } from '../middleware/auth.js';

const router = Router();

// Text detection routes
router.post('/text', auth, async (req, res) => {
  // TODO: Implement text detection
});

router.get('/texts', auth, async (req, res) => {
  // TODO: Implement get all detected texts
});

router.get('/texts/:id', auth, async (req, res) => {
  // TODO: Implement get single detected text
});

// Word detection routes
router.get('/words', auth, async (req, res) => {
  // TODO: Implement get detected words
});

router.get('/words/:id', auth, async (req, res) => {
  // TODO: Implement get single detected word
});

// Validation routes
router.put('/texts/:id/validate', auth, async (req, res) => {
  // TODO: Implement validation update
});

export default router; 