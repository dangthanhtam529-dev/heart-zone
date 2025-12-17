
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MoodEntry } from '../types';
import { NEGATIVE_MOODS, POSITIVE_MOODS } from '../constants';
import { useAuth } from './AuthContext';
import { SecureStorage } from '../utils/encryption';

interface MoodContextType {
  moods: MoodEntry[];
  addMood: (entry: Omit<MoodEntry, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  deleteMood: (id: string) => Promise<void>;
  healingSuggestion: MoodEntry | null;
  clearHealingSuggestion: () => void;
  isLoading: boolean;
  exportData: () => void;
  clearAllData: () => void;
  // 标签功能
  getAllTags: () => string[];
  getMoodsByTag: (tag: string) => MoodEntry[];
  getTagCounts: () => Record<string, number>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const DB_MOODS_KEY = 'heartspace_moods_db';

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [healingSuggestion, setHealingSuggestion] = useState<MoodEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load moods from LocalStorage
  const fetchMoods = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const allMoods: MoodEntry[] = SecureStorage.getItem(DB_MOODS_KEY) || [];
      // Filter for current user
      const userMoods = allMoods.filter(m => m.userId === user.id);
      // Sort by timestamp desc
      setMoods(userMoods.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error("Failed to load moods", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial Fetch
  useEffect(() => {
    if (user) {
      fetchMoods();
    } else {
      setMoods([]);
    }
  }, [user, fetchMoods]);

  // Clean up old entries to manage storage space
  const cleanupOldEntries = useCallback((allMoods: MoodEntry[], userId: string) => {
    // Keep entries from the last 6 months to ensure we have at least 3 months capacity
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    return allMoods.filter(m => 
      m.userId !== userId || // Keep other users' data
      m.timestamp > sixMonthsAgo // Keep recent entries for current user
    );
  }, []);

  const addMood = useCallback(async (entryData: Omit<MoodEntry, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) return;

    const newEntry: MoodEntry = {
      ...entryData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      userId: user.id
    };

    try {
      // Save to LS
      let allMoods: MoodEntry[] = SecureStorage.getItem(DB_MOODS_KEY) || [];
      
      // Clean up old entries to manage storage
      allMoods = cleanupOldEntries(allMoods, user.id);
      
      allMoods.push(newEntry);
      SecureStorage.setItem(DB_MOODS_KEY, allMoods);

      // Update State
      setMoods(prev => [newEntry, ...prev]);

      // Healing Logic - 暂时取消
      // if (NEGATIVE_MOODS.includes(newEntry.mood)) {
      //   const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      //   
      //   // Search in current user's moods (use state or re-filter)
      //   const userMoods = allMoods.filter(m => m.userId === user.id);
      //   const candidates = userMoods.filter(m => 
      //     m.timestamp > sevenDaysAgo && 
      //     POSITIVE_MOODS.includes(m.mood) &&
      //     m.id !== newEntry.id
      //   );

      //   if (candidates.length > 0) {
      //     const similar = candidates.find(c => 
      //       c.activity.includes(newEntry.activity) || 
      //       newEntry.activity.includes(c.activity) ||
      //       c.location.includes(newEntry.location)
      //     );
      //     setHealingSuggestion(similar || candidates[0]);
      //   }
      // }
    } catch (e) {
      console.error("Failed to add mood", e);
      alert("保存失败，可能是本地存储已满");
    }
  }, [user, cleanupOldEntries]);

  const deleteMood = useCallback(async (id: string) => {
    if (!user) return;
    
    let allMoods: MoodEntry[] = SecureStorage.getItem(DB_MOODS_KEY) || [];
    allMoods = allMoods.filter(m => m.id !== id);
    SecureStorage.setItem(DB_MOODS_KEY, allMoods);

    setMoods(prev => prev.filter(m => m.id !== id));
  }, [user]);

  const clearHealingSuggestion = useCallback(() => {
    setHealingSuggestion(null);
  }, []);

  const exportData = useCallback(() => {
    if(!moods.length) return;
    const dataStr = JSON.stringify(moods, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heartspace_backup_${formatDate(new Date())}.json`;
    link.click();
  }, [moods]);

  const clearAllData = useCallback(() => {
     if(!user) return;
     let allMoods: MoodEntry[] = SecureStorage.getItem(DB_MOODS_KEY) || [];
     // Keep other users' data
     const otherUserMoods = allMoods.filter(m => m.userId !== user.id);
     SecureStorage.setItem(DB_MOODS_KEY, otherUserMoods);
     setMoods([]);
  }, [user]);

  // 标签相关功能
  const getAllTags = useCallback(() => {
    const allTags = new Set<string>();
    moods.forEach(mood => {
      if (mood.tags) {
        mood.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  }, [moods]);

  const getMoodsByTag = useCallback((tag: string) => {
    return moods.filter(mood => mood.tags && mood.tags.includes(tag));
  }, [moods]);

  const getTagCounts = useCallback(() => {
    const tagCounts: Record<string, number> = {};
    moods.forEach(mood => {
      if (mood.tags) {
        mood.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return tagCounts;
  }, [moods]);

  return (
    <MoodContext.Provider value={{ 
      moods, 
      addMood, 
      deleteMood, 
      healingSuggestion, 
      clearHealingSuggestion, 
      isLoading,
      exportData,
      clearAllData,
      getAllTags,
      getMoodsByTag,
      getTagCounts
    }}>
      {children}
    </MoodContext.Provider>
  );
};

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export const useMoodStore = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error('useMoodStore must be used within a MoodProvider');
  return context;
};
