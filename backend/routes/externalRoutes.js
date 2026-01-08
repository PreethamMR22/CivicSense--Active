import { Router } from 'express';
import { submitComplaint } from '../controllers/externalApiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All routes in this file are protected by the auth middleware
router.use(protect);

// POST /api/external/submit-complaint
router.post('/submit-complaint', submitComplaint);

export default router;
