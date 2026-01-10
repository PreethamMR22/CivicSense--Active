import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import PostCard from './PostCard';
import { LogOut, Briefcase, Mail, MapPin, Link as LinkIcon, Edit, MoreHorizontal, Calendar, Users, Award } from 'lucide-react';
import Loader2 from './ui/Loader2';
import AlertCircle from './ui/AlertCircle';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import ConfirmationModal from './ui/ConfirmationModal';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getUserPosts, isLoadingUserPosts, userPostsError } = usePosts();

  if (!user) return null;

  const userId = user._id;
  const userPosts = getUserPosts(userId);
  const totalUpvotes = userPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
  const isLoading = isLoadingUserPosts[userId] || false;
  const error = userPostsError[userId] || null;

  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700"></div>
      
      {/* Profile Header */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto -mt-20">
            {user.avatar ? (
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
                />
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center shadow-md">
                  <span className="text-4xl font-bold text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            
            <div className="mt-2 sm:mt-12 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              </div>
              <p className="text-black-600 mt-0.5">CivicSense Member</p>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{user.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-blue-600">
                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                  <a href="#" className="hover:underline">Add profile link</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 w-full sm:w-auto justify-center sm:justify-end">
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSignOutModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
              <ConfirmationModal
                isOpen={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
                onConfirm={logout}
                title="Sign out"
                message="Are you sure you want to sign out?"
                confirmText="Sign out"
                cancelText="Cancel"
              />
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="text-center px-4 border-l border-r border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{totalUpvotes}</p>
            <p className="text-sm text-gray-500">Upvotes</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-4 font-medium text-sm ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-6 py-4 font-medium text-sm ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            About
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading your posts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>Error loading posts: {error}</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">You haven't shared any posts yet.</p>
                <button 
                  onClick={() => setShowCreatePostModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <PostCard post={post} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* About Tab Content */}
      {activeTab === 'about' && (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                <p className="text-gray-600">
                  {user.bio || 'No bio added yet. Click edit to add a bio.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Add your work experience</p>
                      <p className="text-sm text-gray-500">Showcase your professional journey</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-500" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      Community Service
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      Problem Solving
                    </span>
                    <button className="text-blue-600 text-sm hover:underline">
                      + Add skill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Post Modal */}
      <CreatePostModal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} />
    </div>
  );
}
