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
      longitude, 
      image: imageUrl 
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

    // Use the image URL from the request body if provided
    // or use the uploaded file's URL if a file was uploaded
    let finalImageUrl = imageUrl || '';

    // Process image if file is uploaded
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'posts',
          resource_type: 'auto'
        });
        finalImageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue with the provided URL if upload fails
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
