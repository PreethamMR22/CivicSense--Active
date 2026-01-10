import { usePosts } from '../contexts/PostsContext';
import PostCard from './PostCard';
import { CreatePost } from './CreatePost';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

export default function Feed() {
  const { filteredPosts: posts, searchQuery } = usePosts();

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="space-y-6 relative">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 md:right-8 bottom-16 md:bottom-8 bg-white text-black rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-105 z-40 hover:bg-gray-50 border border-gray-200"
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faAngleUp} className="text-2xl" />
        </button>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray mb-2">
          {searchQuery ? 'Search Results' : 'Community Feed'}
        </h1>
        <p className="text-gray-400">
          {searchQuery 
            ? `Showing posts matching "${searchQuery}"`
            : 'Browse and engage with local complaints'}
        </p>
      </div>
      <CreatePost />
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery ? 'No matching posts found' : 'No posts yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? `We couldn't find any posts matching "${searchQuery}"`
                : 'Be the first to share something with the community!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
