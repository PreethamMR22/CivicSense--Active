import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role: 'user' | 'admin') => Promise<User>;
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  user?: T;
  token?: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

type AuthMeResponse = UserData;

interface LoginResponse {
  token: string;
  user: UserData;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { showToast } = useToast();

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', 'POST', {
        email,
        password,
      }, false);

      if (!response.success) {
        const errorMessage = response.error || 'Login failed';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      const { token, user } = response;
      
      if (!token || !user) {
        const errorMessage = 'Invalid response from server';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      };
      
      // Set user in state and mark as authenticated
      setUser(userData);
      setIsAuthenticated(true);
      
      showToast('Successfully logged in!', 'success');
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setUser(null);
      setIsAuthenticated(false);
      
      // Show error toast if it's not a validation error (those are shown above)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (!errorMessage.includes('Login failed') && !errorMessage.includes('Invalid response')) {
        showToast('An error occurred during login. Please try again.', 'error');
      }
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
        const errorMessage = response.error || 'Registration failed';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      const { token, user } = response;
      
      if (!token || !user) {
        const errorMessage = 'Invalid response from server';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state and mark as authenticated
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      showToast('Account created successfully!', 'success');
      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setUser(null);
      setIsAuthenticated(false);
      
      // Show error toast if it's not a validation error (those are shown above)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (!errorMessage.includes('Registration failed') && !errorMessage.includes('Invalid response')) {
        showToast('An error occurred during registration. Please try again.', 'error');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', 'GET');
      showToast('Successfully logged out', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('An error occurred during logout', 'error');
    } finally {
      // Clear user data and authentication state
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Check for existing token on initial load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!token) {
        // Clear any stored user data if no token exists
        localStorage.removeItem('userEmail');
        setLoading(false);
        return;
      }
      
      if (!userEmail) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiRequest<ApiResponse<AuthMeResponse>>('/auth/me', 'GET');
        
        if (!isMounted) return;
        
        // Log the response to debug
        console.log('Auth response:', response);
        
        // Try to get user data from different possible response structures
        const userData = response.user || response.data;
        
        if (response.success && userData) {
          const { _id, name, email, role, avatar } = userData;
          
          if (!_id || !name || !email || !role) {
            throw new Error('Incomplete user data received');
          }
          
          setUser({
            _id,
            name,
            email,
            role,
            avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          });
          setIsAuthenticated(true);
        } else {
          throw new Error(response.error || 'Invalid user data received');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
