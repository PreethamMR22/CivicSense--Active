import { useState } from 'react';
import { Post } from '../types';
import { ArrowBigUp, MessageCircle, MapPin, Tag } from 'lucide-react';
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

  const hasUpvoted = user ? post.upvotedBy.includes(user.id) : false;

  const handleUpvote = () => {
    if (user) {
      upvotePost(post.id, user.id);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && commentText.trim()) {
      addComment(post.id, {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: commentText.trim()
      });
      setCommentText('');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {post.userAvatar ? (
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {post.userName.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-white font-semibold">{post.userName}</h3>
            <p className="text-gray-400 text-sm">{formatDate(post.createdAt)}</p>
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>

        <p className="text-gray-300 mb-3 leading-relaxed">{post.description}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-48 object-cover rounded-xl mb-3"
          />
        )}

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">{post.location}</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-gray-700/50">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              hasUpvoted
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <ArrowBigUp className={`w-5 h-5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span className="font-semibold">{post.upvotes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700/30 text-gray-400 hover:bg-gray-700/50 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{post.comments.length}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/30">
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {comment.userName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{comment.userName}</p>
                  <p className="text-gray-400 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
