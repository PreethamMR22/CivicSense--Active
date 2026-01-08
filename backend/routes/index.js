import { Router } from 'express';
const router = Router();
import exampleRoutes from './exampleRoutes.js';
import authRoutes from './authRoutes.js';
import postRoutes from './posts.js';
import externalRoutes from './externalRoutes.js';

// Mount routes
router.use('/example', exampleRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/external', externalRoutes);

export default router;
