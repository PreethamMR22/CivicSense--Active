import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { 
  createPost,
  getPosts,
  getPost
} from '../controllers/postController.js';

// Middleware to handle both JSON and form-data
const handleImageUpload = (req, res, next) => {
  // If no file is being uploaded, skip the multer middleware
  if (!req.is('multipart/form-data')) {
    return next();
  }
  // Otherwise, use multer to handle the file upload
  upload.single('image')(req, res, next);
};

// Create a new post (protected route)
router.post('/', protect, handleImageUpload, createPost);

// Get all posts (public)
router.get('/', getPosts);

// Get single post (public)
router.get('/:id', getPost);

export default router;
