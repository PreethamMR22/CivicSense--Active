import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePostModal from './CreatePostModal';

export const CreatePost = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`}
            alt="User"
            className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <div className="w-full p-3 bg-gray-50 text-gray-500 rounded-lg text-left border border-gray-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              Share an update or report an issue...
            </div>
          </div>
        </div>
      </div>
      
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
