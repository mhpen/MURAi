import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { login } from '../controllers/auth.controller.js';

const router = Router();

// Auth routes
router.post('/register', async (req, res) => {
  // TODO: Implement user registration
});

router.post('/login', login);

// User management routes
router.get('/', [auth, isAdmin], async (req, res) => {
  // TODO: Implement get all users
});

router.get('/:id', auth, async (req, res) => {
  // TODO: Implement get user profile
});

router.put('/:id', auth, async (req, res) => {
  // TODO: Implement update user
});

router.delete('/:id', [auth, isAdmin], async (req, res) => {
  // TODO: Implement delete user
});

// User preferences
router.put('/:id/preferences', auth, async (req, res) => {
  // TODO: Implement update user preferences
});

export default router; 