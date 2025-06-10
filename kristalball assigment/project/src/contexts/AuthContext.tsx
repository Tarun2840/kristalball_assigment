import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@military.gov',
    fullName: 'System Administrator',
    role: 'Admin',
    assignedBases: ['base-1', 'base-2', 'base-3'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'commander',
    email: 'commander@military.gov',
    fullName: 'Base Commander Johnson',
    role: 'Base Commander',
    assignedBases: ['base-1'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    username: 'logistics',
    email: 'logistics@military.gov',
    fullName: 'Logistics Officer Smith',
    role: 'Logistics Officer',
    assignedBases: ['base-1', 'base-2'],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app load
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in production, this would be a real API call
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser && password === 'password') { // Mock password check
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};