import { apiRequest, ApiResponse } from '../utils/api';

// Update the Post interface to match the backend model
export interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  description: string;
  location: string;
  tags: string[];
  image: string;
  upvotes?: number;
  upvotedBy?: string[];
  comments?: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email?: string;
    };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Response type for getting a list of posts
export interface PostsListResponse {
  success: boolean;
  data: Post[];
  count: number;
  message?: string;
  error?: string;
}

// Response type for getting a single post
export interface SinglePostResponse {
  success: boolean;
  data: Post;
  message?: string;
  error?: string;
}

// Response type for adding a comment
export interface AddCommentResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Response type for creating a post
export interface CreatePostData {
  description: string;
  category: string;
  location: string;
  tags: string;
  image?: string;
  latitude?: number;
  longitude?: number;
}

export const getPosts = async (): Promise<PostsListResponse> => {
  try {
    const response = await apiRequest<{ data: Post[]; count: number }>('/posts', 'GET', null, false);
    if (!response) throw new Error('No response from server');
    
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      count: 1,
      message: response.message || 'Posts fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { 
      success: false, 
      data: [], 
      count: 0, 
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getPostsByUser = async (userId: string): Promise<PostsListResponse> => {
  try {
    const response = await apiRequest<{ data: Post[]; count: number }>(
      `/posts/user/${userId}`, 
      'GET', 
      null, 
      true
    );
    
    if (!response) throw new Error('No response from server');
    
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      count: 0,
      message: response.message || 'User posts fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return { 
      success: false, 
      data: [], 
      count: 0, 
      message: error instanceof Error ? error.message : 'Failed to fetch user posts',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const upvotePost = async (postId: string): Promise<ApiResponse> => {
  try {
    const response = await apiRequest<ApiResponse>(`/posts/${postId}/upvote`, 'POST');
    return {
      success: response?.success ?? false,
      message: response?.message
    };
  } catch (error) {
    console.error('Error upvoting post:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to upvote post' 
    };
  }
};

export const addComment = async (postId: string, content: string): Promise<AddCommentResponse> => {
  try {
    const response = await apiRequest<{ comment: any }>(
      `/posts/${postId}/comments`, 
      'POST', 
      { content }
    );
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to add comment',
        message: response.message
      };
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    return {
      success: false,
      error: 'An error occurred while adding the comment',
      message: 'An unexpected error occurred'
    };
  }
};

export const createPost = async (postData: CreatePostData): Promise<SinglePostResponse> => {
  try {
    const response = await apiRequest<Post>(
      '/posts',
      'POST',
      {
        ...postData,
        // Ensure tags is a string as expected by the backend
        tags: postData.tags
      }
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        message: 'Post created successfully'
      };
    } else {
      return {
        success: false,
        data: {} as Post, // Provide a default empty Post object
        error: response.error || 'Failed to create post',
        message: response.message
      };
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      data: {} as Post, // Provide a default empty Post object
      error: 'An error occurred while creating the post',
      message: 'An unexpected error occurred'
    };
  }
};