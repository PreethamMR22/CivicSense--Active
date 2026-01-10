import React, { useState } from 'react';
import { Search, Home, MessageCircle, Bell, UserCircle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { usePosts } from '../contexts/PostsContext';
import CreatePostModal from './CreatePostModal';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  current: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, current }) => (
  <Link
    to={href}
    className={`flex flex-col items-center text-center px-2 py-1 text-sm font-medium ${
      current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <div className="h-6 w-6 flex items-center justify-center">
      {React.cloneElement(icon as React.ReactElement, {
        className: `h-5 w-5 ${current ? 'text-blue-600' : 'text-gray-500'}`,
        fill: current ? 'currentColor' : 'none',
      })}
    </div>
    <span className="mt-1 text-xs">{label}</span>
  </Link>
);

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = usePosts();

  const navItems = [
    { icon: <Home />, label: 'Home', href: '/' },
    { icon: <MessageCircle />, label: 'Messages', href: '/messaging' },
    { 
      icon: <div className="bg-gray-800 text-white p-2 rounded-md"><FontAwesomeIcon icon={faSquarePlus} className="h-6 w-6" /></div>, 
      label: 'Create', 
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCreatePostModalOpen(true);
      }
    },
    { icon: <Bell />, label: 'Alerts', href: '/notifications' },
  ];
  
  // Profile item is handled separately in the UI

  return (
    <>
      {/* Desktop Navbar - shown on md screens and up */}
      <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <img
                    className="h-10 w-auto"
                    src="/logo.png"
                    alt="CivicSense Logo"
                    style={{height:'10rem'}}
                  />
                </Link>
              </div>
              
              <div className="hidden md:block ml-6">
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                item.onClick ? (
                  <button
                    key={item.href}
                    onClick={item.onClick}
                    className={`flex flex-col items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.href ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="h-6 w-6 flex items-center justify-center">
                      {React.cloneElement(item.icon, {
                        className: `h-5 w-5 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`,
                        fill: location.pathname === item.href ? 'currentColor' : 'none',
                      })}
                    </div>
                    <span className="mt-1 text-xs">{item.label}</span>
                  </button>
                ) : (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    current={location.pathname === item.href}
                  />
                )
              ))}
              {/* Profile link with avatar */}
              <Link
                to="/profile"
                className={`flex flex-col items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="h-6 w-6 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </div>
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar - shown on screens smaller than md */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            // Skip the profile item as we'll add it separately
            if (item.href === '/profile') return null;
            
            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center flex-1 h-full text-gray-500"
                >
                  <div className="h-6 w-6 flex items-center justify-center">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: 'h-5 w-5 text-gray-500',
                      fill: 'none'
                    })}
                  </div>
                  <span className="text-xs mt-0.5">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="h-6 w-6 flex items-center justify-center">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: `h-5 w-5 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`,
                    fill: location.pathname === item.href ? 'currentColor' : 'none',
                  })}
                </div>
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Profile link with avatar */}
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className="h-6 w-6 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <UserCircle className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostModalOpen} 
        onClose={() => setIsCreatePostModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
