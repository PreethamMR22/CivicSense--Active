import Post from '../models/Post.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    // Get all fields from request body
    const { 
      description, 
      category = '', 
      location = '', 
      tags = '', 
      latitude, 
      longitude
    } = req.body;
    
    // Log the incoming request body for debugging
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Initialize image URL
    let finalImageUrl = '';

    // Process image if image data is provided in the request
    if (req.body.image) {
      try {
        // Check if it's a base64 string
        if (req.body.image.startsWith('data:image')) {
          const result = await cloudinary.uploader.upload(req.body.image, {
            folder: 'posts',
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          });
          finalImageUrl = result.secure_url;
        } else {
          // If it's already a URL, use it directly
          finalImageUrl = req.body.image;
        }
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error processing image',
          error: uploadError.message
        });
      }
    } else if (req.file) {
      // Fallback to file upload if no image in request body
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'posts',
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
          error: uploadError.message
        });
      }
    }

    // Process tags
    const tagsArray = typeof tags === 'string' && tags.trim() !== '' 
      ? tags.split(',').map(tag => tag.trim())
      : [];

    // Create new post with all fields
    const postData = {
      user: req.user.id,
      description,
      ...(category && { category }),
      ...(location && { location }),
      ...(finalImageUrl && { image: finalImageUrl }),
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(longitude && { longitude: parseFloat(longitude) }),
      ...(tagsArray.length > 0 && { tags: tagsArray })
    };
    
    // Log the data being saved for debugging
    console.log('Saving post with data:', JSON.stringify(postData, null, 2));
    
    // Ensure the image field is always included, even if empty
    if (!postData.image) {
      postData.image = '';
    }

    const post = await Post.create(postData);
    
    res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
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
