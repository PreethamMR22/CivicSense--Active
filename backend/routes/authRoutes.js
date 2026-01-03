import { Router } from 'express';
const router = Router();
import { 
  register, 
  login, 
  logout, 
  getMe 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

export default router;
