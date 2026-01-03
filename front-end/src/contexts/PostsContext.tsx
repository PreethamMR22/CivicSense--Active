import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment } from '../types';

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'upvotes' | 'upvotedBy' | 'comments' | 'createdAt'>) => void;
  upvotePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getUserPosts: (userId: string) => Post[];
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);
const initialPosts: Post[] = [
  // Existing posts
  {
    id: '1',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Broken streetlight on Main Street causing safety concerns. This has been an issue for over 2 weeks now.',
    imageUrl: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['safety', 'infrastructure'],
    category: 'Public Safety',
    location: 'Main Street, Downtown',
    upvotes: 24,
    upvotedBy: ['1'],
    comments: [
      {
        id: 'c1',
        userId: '1',
        userName: 'John Doe',
        userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'I noticed this too! Very dangerous at night.',
        createdAt: new Date(Date.now() - 86400000)
      }
    ],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Doe',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Pothole on Oak Avenue needs immediate attention. Multiple vehicles have been damaged.',
    imageUrl: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['road', 'maintenance'],
    category: 'Infrastructure',
    location: 'Oak Avenue',
    upvotes: 18,
    upvotedBy: ['2'],
    comments: [],
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: '3',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Park playground equipment is rusty and unsafe for children.',
    imageUrl: 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['park', 'children', 'safety'],
    category: 'Public Facilities',
    location: 'Central Park',
    upvotes: 31,
    upvotedBy: ['1', '2'],
    comments: [
      {
        id: 'c2',
        userId: '1',
        userName: 'John Doe',
        userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'This is concerning. Hope it gets fixed soon.',
        createdAt: new Date(Date.now() - 43200000)
      }
    ],
    createdAt: new Date(Date.now() - 345600000)
  },
  // New posts
  {
    id: '4',
    userId: '3',
    userName: 'Alex Johnson',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Water supply disruption in the downtown area. No water since yesterday morning.',
    imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['water', 'emergency', 'utilities'],
    category: 'Public Utilities',
    location: 'Downtown Area',
    upvotes: 42,
    upvotedBy: ['1', '2', '3'],
    comments: [
      {
        id: 'c3',
        userId: '2',
        userName: 'Jane Smith',
        userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'Still no water in my building. Any updates from the authorities?',
        createdAt: new Date(Date.now() - 21600000)
      }
    ],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '5',
    userId: '4',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.pexels.com/photos/712521/pexels-photo-712521.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Garbage not collected for a week in the Westside neighborhood. Starting to smell really bad!',
    imageUrl: 'https://images.pexels.com/photos/158780/leaf-nature-green-spring-158780.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['sanitation', 'garbage', 'health'],
    category: 'Sanitation',
    location: 'Westside Neighborhood',
    upvotes: 28,
    upvotedBy: ['1', '4'],
    comments: [],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: '6',
    userId: '5',
    userName: 'Mike Chen',
    userAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Street light flickering non-stop at the intersection of 5th and Maple. Needs immediate attention!',
    imageUrl: 'https://images.pexels.com/photos/355321/pexels-photo-355321.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['safety', 'electricity', 'night'],
    category: 'Public Safety',
    location: '5th and Maple Intersection',
    upvotes: 15,
    upvotedBy: ['2', '3', '5'],
    comments: [
      {
        id: 'c4',
        userId: '1',
        userName: 'John Doe',
        userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'I reported this last week too. No action taken yet.',
        createdAt: new Date(Date.now() - 86400000)
      }
    ],
    createdAt: new Date(Date.now() - 604800000)
  },
  {
    id: '7',
    userId: '6',
    userName: 'Priya Patel',
    userAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Traffic signal not working at the main square. Causing major traffic jams during rush hour.',
    imageUrl: 'https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['traffic', 'safety', 'urgent'],
    category: 'Traffic Management',
    location: 'Main Square',
    upvotes: 37,
    upvotedBy: ['1', '2', '3', '4'],
    comments: [],
    createdAt: new Date(Date.now() - 432000000)
  },
  {
    id: '8',
    userId: '7',
    userName: 'David Kim',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Severe water logging after rain near the community center. Impossible to walk through.',
    imageUrl: 'https://images.pexels.com/photos/260931/pexels-photo-260931.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['drainage', 'flooding', 'walkway'],
    category: 'Drainage',
    location: 'Near Community Center',
    upvotes: 22,
    upvotedBy: ['5', '6', '7'],
    comments: [
      {
        id: 'c5',
        userId: '2',
        userName: 'Jane Smith',
        userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'This has been an issue for months. The drainage system needs an upgrade.',
        createdAt: new Date(Date.now() - 172800000)
      }
    ],
    createdAt: new Date(Date.now() - 691200000)
  },
  {
    id: '9',
    userId: '8',
    userName: 'Lisa Wong',
    userAvatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Loud construction noise continuing past permitted hours. Disturbing residents in the area.',
    imageUrl: 'https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['noise', 'construction', 'disturbance'],
    category: 'Noise Pollution',
    location: 'Riverside Apartments',
    upvotes: 19,
    upvotedBy: ['1', '3', '8'],
    comments: [],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '10',
    userId: '9',
    userName: 'Carlos Mendez',
    userAvatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Damaged footpath near the school. Dangerous for children walking to school.',
    imageUrl: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['safety', 'school', 'walkway'],
    category: 'Infrastructure',
    location: 'Near Oakwood Elementary',
    upvotes: 33,
    upvotedBy: ['2', '4', '6', '8'],
    comments: [
      {
        id: 'c6',
        userId: '3',
        userName: 'Alex Johnson',
        userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'I\'ve reported this multiple times. It\'s been months with no action!',
        createdAt: new Date(Date.now() - 432000000)
      }
    ],
    createdAt: new Date(Date.now() - 2592000000)
  },
  {
    id: '11',
    userId: '10',
    userName: 'Aisha Khan',
    userAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Stray dogs causing problems in the park. Children and elderly feel unsafe.',
    imageUrl: 'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['animals', 'safety', 'park'],
    category: 'Animal Control',
    location: 'Green Valley Park',
    upvotes: 27,
    upvotedBy: ['1', '5', '7', '9'],
    comments: [],
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: '12',
    userId: '11',
    userName: 'James Wilson',
    userAvatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Illegal parking in the no-parking zone near the hospital. Blocking emergency vehicles.',
    imageUrl: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['parking', 'emergency', 'traffic'],
    category: 'Traffic Management',
    location: 'City General Hospital',
    upvotes: 45,
    upvotedBy: ['2', '3', '4', '6', '8', '10'],
    comments: [
      {
        id: 'c7',
        userId: '4',
        userName: 'Sarah Williams',
        userAvatar: 'https://images.pexels.com/photos/712521/pexels-photo-712521.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'This is a serious safety hazard. I\'ve seen ambulances get delayed because of this!',
        createdAt: new Date(Date.now() - 86400000)
      }
    ],
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: '13',
    userId: '12',
    userName: 'Emily Chen',
    userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Graffiti on the community center walls. Vandalism needs to be cleaned up.',
    imageUrl: 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['vandalism', 'cleanup', 'community'],
    category: 'Community Issues',
    location: 'Westside Community Center',
    upvotes: 12,
    upvotedBy: ['1', '5', '9'],
    comments: [],
    createdAt: new Date(Date.now() - 432000000)
  }
];

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    // BACKEND API INTEGRATION POINT
    // GET /api/posts
    // Response: { posts: Post[] }
    // This would fetch posts from the backend on mount
  }, []);

  const addPost = (postData: Omit<Post, 'id' | 'upvotes' | 'upvotedBy' | 'comments' | 'createdAt'>) => {
    // BACKEND API INTEGRATION POINT
    // POST /api/posts
    // Body: postData
    // Response: { post: Post }

    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      createdAt: new Date()
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const upvotePost = (postId: string, userId: string) => {
    // BACKEND API INTEGRATION POINT
    // POST /api/posts/:id/upvote
    // Body: { userId }
    // Response: { post: Post }

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

  const addComment = (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    // BACKEND API INTEGRATION POINT
    // POST /api/posts/:id/comment
    // Body: commentData
    // Response: { comment: Comment }

    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

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
      getUserPosts
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
