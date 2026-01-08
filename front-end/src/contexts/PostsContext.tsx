import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment } from '../types';
import { getPosts, upvotePost as apiUpvotePost, addComment as apiAddComment, createPost, Post as APIPost } from '../services/postService';

interface PostsContextType {
  posts: Post[];
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
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getUserPosts: (userId: string) => Post[];
  isLoadingUserPosts: { [key: string]: boolean };
  userPostsError: { [key: string]: string | null };
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);
const initialPosts: Post[] = [];

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getPosts();
        if (response.success) {
          // Transform the API response to match our frontend Post type
          const transformedPosts = response.data.map((post: any) => ({
            id: post._id,
            userId: post.user._id,
            userName: post.user.name,
            userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random`,
            description: post.description,
            imageUrl: post.image || '',
            tags: post.tags || [],
            category: post.category,
            location: post.location,
            upvotes: post.upvotedBy?.length || 0,
            upvotedBy: post.upvotedBy || [],
            comments: post.comments?.map((comment: any) => ({
              id: comment._id,
              userId: comment.user?._id || '',
              userName: comment.user?.name || 'Unknown User',
              userAvatar: comment.user?.name 
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=random`
                : '',
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
      const { userId, userName, ...postPayload } = postData;
      
      const response = await createPost({
        ...postPayload,
        description: postData.description,
        category: postData.category || 'Other',
        location: postData.location || 'Location not specified',
        tags: Array.isArray(postData.tags) ? postData.tags.join(',') : (postData.tags || ''),
        image: postData.image || '',
        latitude: postData.latitude,
        longitude: postData.longitude
      });

      if (response.success && response.data) {
        const newPost: Post = {
          id: response.data._id,
          userId: userId,
          userName: userName,
          userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`,
          description: response.data.description,
          imageUrl: response.data.image || '',
          tags: response.data.tags || [],
          category: response.data.category || 'Other',
          location: response.data.location || 'Location not specified',
          upvotes: 0,
          upvotedBy: [],
          comments: [],
          createdAt: new Date()
        };
        
        setPosts(prevPosts => [newPost, ...prevPosts]);
        return { success: true, post: newPost };
      } else {
        console.error('Failed to create post:', response.error);
        return { success: false, error: response.error || 'Failed to create post' };
      }
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: 'An error occurred while creating the post' };
    }
  };

  const upvotePost = (postId: string, userId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
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

  const addComment = (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            userId: comment.userId,
            userName: comment.userName,
            userAvatar: comment.userAvatar,
            content: comment.content,
            createdAt: new Date()
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  }

  const getUserPosts = (userId: string) => {
    // BACKEND API INTEGRATION POINT
    // GET /api/users/:id/posts
    // Response: { posts: Post[] }

    return posts
      .filter(post => post.userId === userId)
      .sort((a, b) => b.upvotes - a.upvotes);
  };

  const sortedPosts = [...posts].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <PostsContext.Provider value={{
      posts: sortedPosts,
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
