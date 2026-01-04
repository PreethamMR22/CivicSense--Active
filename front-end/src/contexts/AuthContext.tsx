import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: User }>('/auth/login', 'POST', {
        email,
        password,
      }, false);

      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state and mark as authenticated
      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      });
      
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'user' | 'admin') => {
    setLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: User }>('/auth/register', 'POST', {
        name,
        email,
        password,
        role
      }, false);

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state and mark as authenticated
      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      });
      
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', 'GET');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data and authentication state
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Check for existing token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiRequest<{ user: User }>('/auth/me', 'GET');
          if (response.success && response.data) {
            const user = response.data.user;
            setUser({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
