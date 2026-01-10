import { useState } from 'react';
import { Post, Comment } from '../types';
import { ThumbsUp, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Smile, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { upvotePost, addComment } = usePosts();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const hasUpvoted = user ? post.upvotedBy.includes(user._id) : false;

  const handleUpvote = async () => {
    if (!user) return;
    try {
      await upvotePost(post._id, user._id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && commentText.trim()) {
      const newComment: Omit<Comment, '_id' | 'createdAt'> & { createdAt: Date } = {
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar,
        content: commentText.trim(),
        createdAt: new Date()
      };
      addComment(post._id, newComment);
      setCommentText('');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3 relative">
          <div className="flex items-start space-x-3">
            {post.userAvatar ? (
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {post.userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer">
                  {post.userName || 'Anonymous User'}
                </h3>
                {post.userName === 'Admin' && (
                  <span className="text-blue-500" title="Verified">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-gray-500">{post.location || 'Unknown Location'}</p>
                <span className="text-gray-300">•</span>
                <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
              {post.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {post.category}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMoreOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Save post
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Report post
                </button>
                {user?._id === post.userId && (
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Delete post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3 mb-4">
          <p className="text-gray-800 text-sm leading-relaxed">{post.description}</p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="my-3 rounded-lg overflow-hidden border border-gray-100">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full h-auto max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap mt-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Metrics */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              <div className="h-5 w-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                <ThumbsUp className="h-3 w-3 text-blue-600" />
              </div>
              <div className="h-5 w-5 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
                <Heart className="h-3 w-3 text-green-600 fill-current" />
              </div>
            </div>
            <span>{post.upvotedBy.length || 0}</span>
          </div>
          <div>
            <span className="hover:underline cursor-pointer">{post.comments?.length || 0} comments</span>
            <span className="mx-1">•</span>
            <span className="hover:underline cursor-pointer">Share</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-1">
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <button 
            onClick={handleUpvote}
            className={`flex items-center justify-center gap-1 py-2 px-4 rounded-md hover:bg-gray-100 flex-1 transition-colors ${
              hasUpvoted ? 'text-blue-600' : 'hover:text-gray-700'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Like</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center justify-center gap-1 py-2 px-4 rounded-md hover:bg-gray-100 flex-1 transition-colors hover:text-gray-700"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          
          <button className="flex items-center justify-center gap-1 py-2 px-4 rounded-md hover:bg-gray-100 flex-1 transition-colors hover:text-gray-700">
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
          
          <button 
            onClick={handleSave}
            className={`flex items-center justify-center gap-1 py-2 px-4 rounded-md hover:bg-gray-100 flex-1 transition-colors ${
              isSaved ? 'text-blue-600' : 'hover:text-gray-700'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50">
          {/* Comment Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <form onSubmit={handleAddComment} className="flex-1 flex items-center bg-white rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 text-sm border-0 focus:ring-0 focus:outline-none"
                />
                <div className="flex items-center pr-2">
                  <button 
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className={`ml-1 p-1.5 rounded-full ${
                      commentText.trim() 
                        ? 'text-blue-600 hover:bg-blue-50' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
              {post.comments.map((comment: Comment, index: number) => (
                <div key={index} className="flex items-start space-x-2 group">
                  <div className="flex-shrink-0">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {comment.userName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl px-3 py-2 shadow-sm">
                      <div className="flex items-baseline">
                        <span className="text-sm font-semibold text-gray-900 mr-2 hover:underline cursor-pointer">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
                    </div>
                    <div className="flex items-center mt-1 ml-2 space-x-3 text-xs text-gray-500">
                      <button className="hover:underline">Like</button>
                      <span>•</span>
                      <button className="hover:underline">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
