import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Feed from './components/Feed';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>;
  }

  return (
    <Routes>
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-24">
              <div className="max-w-3xl mx-auto px-4 py-6">
                <Feed />
              </div>
              <BottomNav onCreatePost={() => setShowCreateModal(true)} />
              {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
              )}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-24">
              <div className="max-w-3xl mx-auto px-4 py-6">
                <Profile />
              </div>
              <BottomNav onCreatePost={() => setShowCreateModal(true)} />
              {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
              )}
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      
      <Route
        path="/signup"
        element={
          !isAuthenticated ? (
            <Signup />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch all other routes */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PostsProvider>
          <AppContent />
        </PostsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
