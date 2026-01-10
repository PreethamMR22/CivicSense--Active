import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CreatePostModal from './components/CreatePostModal';
import Map from './components/Map';
import { Home, MapPin, User } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const isMapRoute = location.pathname === '/map';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Map', href: '/map', icon: MapPin, current: location.pathname === '/map' },
    { name: 'Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && !isMapRoute && (
        <Navbar />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 pt-4 min-h-[calc(100vh-64px)]">
          {/* Sidebar - Hidden on mobile, shown on md screens and up */}
          {isAuthenticated && !isMapRoute && (
            <div className="hidden md:block w-64 flex-shrink-0 sticky top-16 self-start">
              <Sidebar navigation={navigation} user={user} />
            </div>
          )}
          
          {/* Main Content - Full width on mobile, flex-1 on larger screens */}
          <main className="w-full md:flex-1 overflow-y-auto pb-24">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="max-w-2xl mx-auto py-6">
                      <Feed />
                    </div>
                    {showCreateModal && (
                      <CreatePostModal onClose={() => setShowCreateModal(false)} />
                    )}
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
                      <div className="max-w-2xl mx-auto py-6">
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
                  <Navigate to="/" replace />
                }
              />
            </Routes>
          </main>
          
          {isAuthenticated && !isMapRoute && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Sponsored</h3>
                  <p className="text-sm text-gray-500">Advertise on CivicSense</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Trending in your area</h3>
                  <div className="space-y-3">
                    {['Road Repairs', 'Water Supply', 'Power Outages'].map((topic) => (
                      <div key={topic} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
