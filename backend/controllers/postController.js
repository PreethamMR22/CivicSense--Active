import Post from '../models/Post.js';
import { cloudinary } from '../config/cloudinary.js';
import { promisify } from 'util';
import stream from 'stream';
import streamifier from 'streamifier';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
// Promisify the pipeline function
const pipeline = promisify(stream.pipeline);

export const createPost = async (req, res) => {
  try {
    // Get all fields from request body or form-data
    const { 
      description, 
      category = 'Other', 
      location = '', 
      tags = '',
      userId,
      userName
    } = req.body;
    
    // Log the incoming request for debugging
    console.log('Request received - Content-Type:', req.get('Content-Type'));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('File received:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Initialize image URL
    let finalImageUrl = '';

    // Process image if file is uploaded
    if (req.file) {
      try {
        // Convert buffer to base64 for Cloudinary
        const base64Data = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;
        
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'posts',
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });
        
        finalImageUrl = result.secure_url;
        console.log('Image uploaded successfully:', finalImageUrl);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading image',
          error: error.message
        });
      }
    }

    // Process tags
    const tagsArray = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : Array.isArray(tags) 
        ? tags.map(tag => typeof tag === 'string' ? tag.trim() : '').filter(Boolean)
        : [];

    // Create post data object
    const postData = {
      user: userId,
      userName,
      description,
      category,
      location,
      ...(finalImageUrl && { image: finalImageUrl }),
      tags: tagsArray
    };
    
    // Log the data being saved for debugging
    console.log('Saving post with data:', JSON.stringify(postData, null, 2));

    const post = await Post.create(postData);
    
    return res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'name email').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name email');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
