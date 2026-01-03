import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import Login from './components/Login';
import Feed from './components/Feed';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal';
import { Screen } from './types';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {currentScreen === 'feed' && <Feed />}
        {currentScreen === 'profile' && <Profile />}
      </div>

      <BottomNav
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onCreatePost={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <AppContent />
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;
