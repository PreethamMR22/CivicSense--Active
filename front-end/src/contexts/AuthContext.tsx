import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dummyUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    role: 'user' as const
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    role: 'admin' as const
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundUser = [...dummyUsers, ...(JSON.parse(localStorage.getItem('users') || '[]') as User[])].find(u => u.email === email);
      if (foundUser && password) {
        setUser(foundUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, _password: string, role: 'user' | 'admin') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      if (users.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      
      // Save to local storage (in a real app, this would be an API call)
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      
      // Log the user in
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // BACKEND API INTEGRATION POINT
    // POST /api/auth/logout
    setUser(null);
  };

  // Set initial loading to false after first render
  useEffect(() => {
    // Simulate checking if user is logged in
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
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
