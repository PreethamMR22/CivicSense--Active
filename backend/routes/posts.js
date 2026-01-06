import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { 
  createPost,
  getPosts,
  getPost
} from '../controllers/postController.js';

// Create a new post (protected route)
router.post('/', protect, upload.single('image'), createPost);

// Get all posts (public)
router.get('/', getPosts);

// Get single post (public)
router.get('/:id', getPost);

export default router;
