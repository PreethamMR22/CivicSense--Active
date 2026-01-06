import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Feed from './components/Feed';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal';
import Map from './components/Map';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const isMapRoute = location.pathname === '/map';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading...</div>;
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="pb-24">
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <Feed />
                </div>
                {showCreateModal && (
                  <CreatePostModal onClose={() => setShowCreateModal(false)} />
                )}
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="pb-24">
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <Profile />
                </div>
                {showCreateModal && (
                  <CreatePostModal onClose={() => setShowCreateModal(false)} />
                )}
              </div>
            </ProtectedRoute>
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
      
      {isAuthenticated && (
        <BottomNav onCreatePost={() => setShowCreateModal(true)} />
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <PostsProvider>
          <AppContent />
        </PostsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
