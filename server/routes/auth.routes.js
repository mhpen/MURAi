import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import { 
  login, 
  register, 
  logout, 
  getProfile, 
  updateProfile 
} from '../controllers/auth.controller.js';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', auth, logout);

// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Test route
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Auth routes working', user: req.user });
});

export default router; 