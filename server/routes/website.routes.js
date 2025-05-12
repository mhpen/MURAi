import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all websites
router.get('/', auth, async (req, res) => {
  // TODO: Implement get all websites
});

// Get single website
router.get('/:id', auth, async (req, res) => {
  // TODO: Implement get single website
});

// Create website
router.post('/', [auth, isAdmin], async (req, res) => {
  // TODO: Implement create website
});

// Update website
router.put('/:id', [auth, isAdmin], async (req, res) => {
  // TODO: Implement update website
});

// Delete website
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  // TODO: Implement delete website
});

export default router; 