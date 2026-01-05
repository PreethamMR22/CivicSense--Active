import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import PostCard from './PostCard';
import { LogOut, Award, Loader2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getUserPosts, isLoadingUserPosts, userPostsError } = usePosts();

  if (!user) return null;

  const userId = user._id;
  const userPosts = getUserPosts(userId);
  const totalUpvotes = userPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
  const isLoading = isLoadingUserPosts[userId] || false;
  const error = userPostsError[userId] || null;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-white">{userPosts.length}</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <p className="text-gray-400 text-sm">Total Upvotes</p>
            </div>
            <p className="text-3xl font-bold text-white">{totalUpvotes}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Your Complaints</h3>
        {isLoading ? (
          <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading your posts...</p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-6 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>Error loading posts: {error}</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-gray-400">You haven't posted any complaints yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
