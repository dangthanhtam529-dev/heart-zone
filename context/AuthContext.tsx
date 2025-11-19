
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DB_USERS_KEY = 'heartspace_users_db';
const STORAGE_TOKEN_KEY = 'heartspace_token';
const STORAGE_USER_KEY = 'heartspace_user';

// Utility to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsersFromDB = (): User[] => {
    const json = localStorage.getItem(DB_USERS_KEY);
    return json ? JSON.parse(json) : [];
  };

  const saveUsersToDB = (users: User[]) => {
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    await delay(500); // Simulate request
    const users = getUsersFromDB();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const sessionToken = `fake-jwt-${Date.now()}`; // Simulated Token
      const safeUser = { ...foundUser }; // In real app, exclude password
      
      setToken(sessionToken);
      setUser(safeUser);
      localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(safeUser));
    } else {
      throw new Error('邮箱或密码错误');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    await delay(500);
    const users = getUsersFromDB();
    
    if (users.some(u => u.email === email)) {
      throw new Error('该邮箱已被注册');
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password, // Warning: Stored in plain text for this demo only!
      createdAt: Date.now()
    };

    users.push(newUser);
    saveUsersToDB(users);

    // Auto login after register
    const sessionToken = `fake-jwt-${Date.now()}`;
    setToken(sessionToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const updateProfile = async (updates: Partial<User>) => {
    await delay(300);
    if (!user) return;

    const users = getUsersFromDB();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      saveUsersToDB(users);
      
      // Update session
      setUser(updatedUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (oldPwd: string, newPwd: string) => {
    await delay(300);
    if (!user) return;

    const users = getUsersFromDB();
    const dbUser = users.find(u => u.id === user.id);

    if (!dbUser || dbUser.password !== oldPwd) {
      throw new Error('当前密码错误');
    }

    dbUser.password = newPwd;
    saveUsersToDB(users);
    
    // Update session user object (even though password usually isn't in session, we keep it sync for local demo)
    const updatedSessionUser = { ...user, password: newPwd };
    setUser(updatedSessionUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedSessionUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      token,
      login, 
      register, 
      logout, 
      updateProfile,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
