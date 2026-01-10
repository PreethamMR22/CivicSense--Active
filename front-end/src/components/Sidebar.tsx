import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User as UserIcon, Bookmark, Flag, Clock, Users, Briefcase } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
}

interface UserType {
  name?: string;
  avatar?: string;
  location?: string;
}

interface SidebarProps {
  navigation: NavigationItem[];
  user?: UserType;
}

const Sidebar: React.FC<SidebarProps> = ({ navigation, user }) => {
  const location = useLocation();
  
  const sidebarItems = [
    { name: 'Your Profile', href: '/profile', icon: UserIcon },
    { name: 'Saved Items', href: '/saved', icon: Bookmark },
    { name: 'Your Complaints', href: '/my-complaints', icon: Flag },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Services', href: '/services', icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-16 bg-blue-600"></div>
        <div className="px-4 pb-4 -mt-8 relative">
          <div className="flex justify-center">
            {user?.avatar ? (
              <img
                className="h-16 w-16 rounded-full border-4 border-white bg-white"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-sm font-medium text-gray-900">
              {user?.name || 'User Name'}
            </h3>
            <p className="text-xs text-gray-500">
              {user?.location || 'City, Country'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                item.current
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  item.current ? 'text-blue-500' : 'text-gray-400'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Links
          </h3>
          <nav className="mt-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    location.pathname === item.href ? 'text-blue-500' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900">Community Guidelines</h3>
          <p className="mt-1 text-xs text-gray-500">
            Be respectful and follow our community guidelines when posting content.
          </p>
          <div className="mt-3">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
