import { usePosts } from '../contexts/PostsContext';
import PostCard from './PostCard';

export default function Feed() {
  const { posts } = usePosts();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Community Feed</h1>
        <p className="text-gray-400">Browse and engage with local complaints</p>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-gray-400">No complaints yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
