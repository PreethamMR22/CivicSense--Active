import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Post, Comment } from '../types';
import { getPosts, createPost } from '../services/postService';

interface PostsContextType {
  posts: Post[];
  filteredPosts: Post[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addPost: (postData: {
    userId: string;
    userName: string;
    description: string;
    image?: string;
    tags: string | string[];
    category?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<{ success: boolean; post?: Post; error?: string }>;
  upvotePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, '_id' | 'createdAt'>) => void;
  getUserPosts: (userId: string) => Post[];
  isLoadingUserPosts: { [key: string]: boolean };
  userPostsError: { [key: string]: string | null };
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);
const initialPosts: Post[] = [];

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  // Removed unused state variables to fix lint warnings
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return [...posts];
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.description.toLowerCase().includes(query) ||
      (post.tags && Array.isArray(post.tags) && 
        post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [posts, searchQuery]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getPosts();
        if (response.success) {
          // Transform the API response to match our frontend Post type
          const transformedPosts = response.data.map((post: any) => ({
            _id: post._id,
            userId: post.user?._id || '',
            userName: post.user?.name || 'Anonymous',
            userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'U')}&background=random`,
            description: post.description,
            imageUrl: post.image || '',
            tags: post.tags || [],
            category: post.category || 'General',
            location: post.location || '',
            upvotes: post.upvotedBy?.length || 0,
            upvotedBy: post.upvotedBy || [],
            comments: post.comments?.map((comment: any) => ({
              _id: comment._id,
              userId: comment.user?._id || '',
              userName: comment.user?.name || 'Unknown User',
              userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'U')}&background=random`,
              content: comment.content,
              createdAt: new Date(comment.createdAt)
            })) || [],
            createdAt: new Date(post.createdAt)
          }));
          setPosts(transformedPosts);
        } else {
          setError('Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('An error occurred while fetching posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = async (postData: {
    userId: string;
    userName: string;
    description: string;
    image?: string;
    tags: string | string[];
    category?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    try {
      // Convert tags to a comma-separated string if it's an array
      const tags = Array.isArray(postData.tags) ? postData.tags.join(',') : postData.tags;
      
      // Create the post data object with only the fields that have values
      const postDataToSend: any = {
        description: postData.description,
        tags: tags,
      };
      
      // Only include optional fields if they exist
      if (postData.image) postDataToSend.image = postData.image;
      if (postData.category) postDataToSend.category = postData.category;
      if (postData.location) postDataToSend.location = postData.location;
      if (postData.latitude) postDataToSend.latitude = postData.latitude;
      if (postData.longitude) postDataToSend.longitude = postData.longitude;
      
      const response = await createPost(postDataToSend);

      if (response.success && response.data) {
        const newPost: Post = {
          _id: response.data._id,
          userId: response.data.user?._id || '',
          userName: response.data.user?.name || 'Anonymous',
          userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.user?.name || 'U')}&background=random`,
          description: response.data.description,
          imageUrl: response.data.image || '',
          tags: response.data.tags || [],
          category: response.data.category || 'General',
          location: response.data.location || '',
          upvotes: 0,
          upvotedBy: [],
          comments: [],
          createdAt: new Date()
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        return { success: true, post: newPost };
      }
      return { success: false, error: response.error || 'Failed to create post' };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: 'An error occurred while creating the post' };
    }
  };

  const upvotePost = (postId: string, userId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const hasUpvoted = post.upvotedBy.includes(userId);
          return {
            ...post,
            upvotes: hasUpvoted ? post.upvotes - 1 : post.upvotes + 1,
            upvotedBy: hasUpvoted 
              ? post.upvotedBy.filter(id => id !== userId)
              : [...post.upvotedBy, userId]
          };
        }
        return post;
      })
    );
  };

  const addComment = async (postId: string, commentData: Omit<Comment, '_id' | 'createdAt'>) => {
    try {
      // In a real implementation, you would call your API here
      // const response = await apiAddComment(postId, commentData);
      
      // For now, we'll simulate a successful response
      const newComment: Comment = {
        _id: Math.random().toString(36).substr(2, 9), // Temporary ID
        ...commentData,
        createdAt: new Date()
      };
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  newComment
                ]
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getUserPosts = (userId: string) => {
    // BACKEND API INTEGRATION POINT
    // GET /api/users/:id/posts
    // Response: { posts: Post[] }

    return posts
      .filter(post => post.userId === userId)
      .sort((a, b) => b.upvotes - a.upvotes);
  };

  const sortedPosts = useMemo(() => 
    [...posts].sort((a, b) => b.upvotes - a.upvotes), 
    [posts]
  );

  const sortedFilteredPosts = useMemo(() => 
    [...filteredPosts].sort((a, b) => b.upvotes - a.upvotes), 
    [filteredPosts]
  );

  return (
    <PostsContext.Provider value={{
      posts: sortedPosts,
      filteredPosts: searchQuery ? sortedFilteredPosts : sortedPosts,
      searchQuery,
      setSearchQuery,
      addPost,
      upvotePost,
      addComment,
      getUserPosts,
      isLoadingUserPosts: {},
      userPostsError: {}
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
