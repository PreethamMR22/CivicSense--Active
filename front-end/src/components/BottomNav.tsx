import { Home, User, Plus, MapPin, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface BottomNavProps {
  onCreatePost: () => void;
}

const navItems = [
  { id: 'feed', path: '/', icon: Home, label: 'Feed' },
  { id: 'map', path: '/map', icon: MapPin, label: 'Map' },
  { id: 'notifications', path: '/notifications', icon: Bell, label: 'Alerts' },
  { id: 'profile', path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav({ onCreatePost }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Clean up any existing styles on unmount
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById('nav-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-lg border-t border-white/10 shadow-2xl shadow-black/20 safe-area-bottom z-40">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-indigo-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-105 text-gray-400 group-hover:text-white'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'font-semibold text-indigo-400' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 group">
            <button
              onClick={onCreatePost}
              className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
