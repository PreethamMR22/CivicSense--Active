import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'preethamcloud',
  api_key: '829628581851215',
  api_secret: 'baPDATn30mz0zwm_ntnff6yNzaU'
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Create multer upload instance
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export { cloudinary, upload };
