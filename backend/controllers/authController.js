import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  console.log('1. Starting user registration process');
  console.log('2. Request body:', JSON.stringify(req.body, null, 2));
  
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    console.error('3. Validation Error: Missing required fields');
    console.log('   Provided data:', { name, email, password: password ? '***' : 'missing' });
    return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  console.log('3. Validating email format');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('   Invalid email format:', email);
    return next(new ErrorResponse('Please provide a valid email', 400));
  }

  console.log('4. Checking for existing user');
  try {
    const existingUser = await User.findOne({ email }).select('+password');
    if (existingUser) {
      console.error('   User already exists with email:', email);
      return next(new ErrorResponse('User already exists', 400));
    }
    console.log('   No existing user found with this email');

    console.log('5. Creating new user');
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    console.log('6. User created successfully:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Generate token
    console.log('7. Generating JWT token');
    const token = user.getSignedJwtToken();
    console.log('   Token generated successfully');

    console.log('8. Sending success response');
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('!!! ERROR in registration process:');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('   Validation errors:', messages);
      return next(new ErrorResponse(messages, 400));
    }
    
    if (error.code === 11000) {
      console.error('   Duplicate key error:', error.keyValue);
      return next(new ErrorResponse('Duplicate field value entered', 400));
    }
    
    // For any other errors
    console.error('   Unknown error during registration');
    return next(error);
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();

    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      // Only set domain in production if it's configured
      ...(process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN 
        ? { domain: process.env.COOKIE_DOMAIN }
        : {})
    };
    
    console.log('Cookie options:', JSON.stringify(cookieOptions, null, 2));

    // Remove password from output
    user.password = undefined;

    res.status(statusCode)
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating authentication token'
    });
  }
};
