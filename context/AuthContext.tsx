
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { SecureStorage, PasswordManager } from '../utils/encryption';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
    const storedUser = SecureStorage.getItem(STORAGE_USER_KEY);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const getUsersFromDB = (): User[] => {
    return SecureStorage.getItem(DB_USERS_KEY) || [];
  };

  const saveUsersToDB = (users: User[]) => {
    SecureStorage.setItem(DB_USERS_KEY, users);
  };

  const login = async (email: string, password: string) => {
    await delay(500); // Simulate request
    const users = getUsersFromDB();
    const foundUser = users.find(u => u.email === email);

    if (foundUser && PasswordManager.verifyPassword(password, foundUser.password)) {
      // Auto-migrate legacy passwords to hashed version
      if (PasswordManager.needsMigration(foundUser.password)) {
        foundUser.password = PasswordManager.migratePassword(password);
        saveUsersToDB(users);
        console.log('Password automatically migrated to secure hash');
      }

      const sessionToken = `secure-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const safeUser = { ...foundUser };
      delete safeUser.password;
      
      setToken(sessionToken);
      setUser(safeUser);
      localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
      SecureStorage.setItem(STORAGE_USER_KEY, safeUser);
    } else {
      throw new Error('邮箱或密码错误');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    await delay(500);
    
    if (!PasswordManager.isSecurePassword(password)) {
      throw new Error('密码强度不够，请至少包含8个字符，包含字母和数字');
    }
    
    const users = getUsersFromDB();
    
    if (users.some(u => u.email === email)) {
      throw new Error('该邮箱已被注册');
    }

    const hashedPassword = PasswordManager.hashPassword(password);
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: Date.now()
    };

    users.push(newUser);
    saveUsersToDB(users);

    // Auto login after register
    const sessionToken = `secure-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const safeUser = { ...newUser };
    delete safeUser.password;
    
    setToken(sessionToken);
    setUser(safeUser);
    localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
    SecureStorage.setItem(STORAGE_USER_KEY, safeUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    SecureStorage.removeItem(STORAGE_USER_KEY);
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
      
      // Update session (excluding password)
      const safeUser = { ...updatedUser };
      delete safeUser.password;
      setUser(safeUser);
      SecureStorage.setItem(STORAGE_USER_KEY, safeUser);
    }
  };

  const changePassword = async (oldPwd: string, newPwd: string) => {
    await delay(300);
    if (!user) return;

    const users = getUsersFromDB();
    const dbUser = users.find(u => u.id === user.id);
    
    if (!dbUser || !PasswordManager.verifyPassword(oldPwd, dbUser.password)) {
      throw new Error('当前密码错误');
    }

    if (!PasswordManager.isSecurePassword(newPwd)) {
      throw new Error('新密码强度不够，请至少包含8个字符，包含字母和数字');
    }

    // Ensure new password is hashed
    dbUser.password = PasswordManager.hashPassword(newPwd);
    saveUsersToDB(users);
  };

  // 简化的找回密码功能
  const resetPassword = async (email: string, newPassword: string) => {
    await delay(300);
    const users = getUsersFromDB();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, message: '该邮箱未注册' };
    }

    if (!PasswordManager.isSecurePassword(newPassword)) {
      return { success: false, message: '密码强度不够，请至少包含8个字符，包含字母和数字' };
    }

    user.password = PasswordManager.hashPassword(newPassword);
    saveUsersToDB(users);

    return { success: true, message: '密码重置成功！' };
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
      changePassword,
      resetPassword
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
