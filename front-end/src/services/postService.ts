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

// Response type for adding a comment
export interface AddCommentResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export const addComment = async (postId: string, content: string): Promise<AddCommentResponse> => {
  try {
    const response = await apiRequest<{ comment: any }>(
      `/posts/${postId}/comments`, 
      'POST', 
      { content }
    );
    
    return {
      success: true,
      data: response?.data?.comment,
      message: response?.message || 'Comment added successfully'
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add comment',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};