import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample credentials - publicly displayed
const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
  user: {
    id: 'demo-user-1',
    email: 'demo@example.com',
    name: 'Demo User'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('demo-auth-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple credential check
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_CREDENTIALS.user);
      localStorage.setItem('demo-auth-user', JSON.stringify(DEMO_CREDENTIALS.user));
      return {};
    } else {
      return { error: 'Invalid email or password' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('demo-auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { DEMO_CREDENTIALS };