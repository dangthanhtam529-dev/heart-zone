import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MoodReport, MoodType } from '../types';
import { useAuth } from './AuthContext';
import { useMoodStore } from './MoodContext';
import { MOOD_CONFIGS } from '../constants';
import { SecureStorage } from '../utils/encryption';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  isSameWeek, isSameMonth, format, isSunday, isLastDayOfMonth,
  subWeeks, subMonths, isBefore, isAfter, setHours, setMinutes
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ReportContextType {
  weeklyReports: MoodReport[];
  monthlyReports: MoodReport[];
  deleteWeeklyReport: (id: string) => void;
  deleteMonthlyReport: (id: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const DB_WEEKLY_REPORTS_KEY = 'heartspace_weekly_reports';
const DB_MONTHLY_REPORTS_KEY = 'heartspace_monthly_reports';

// Helper to calculate statistics
const calculateMoodStats = (moods: any[]) => {
  const moodCounts: Record<MoodType, number> = {
    [MoodType.HAPPY]: 0,
    [MoodType.CALM]: 0,
    [MoodType.NEUTRAL]: 0,
    [MoodType.TIRED]: 0,
    [MoodType.SAD]: 0,
    [MoodType.ANNOYED]: 0,
  };

  moods.forEach(mood => {
    if (moodCounts[mood.mood] !== undefined) {
      moodCounts[mood.mood]++;
    }
  });

  let topMood: MoodType | null = null;
  let maxCount = 0;

  (Object.keys(moodCounts) as MoodType[]).forEach(mood => {
    if (moodCounts[mood] > maxCount) {
      maxCount = moodCounts[mood];
      topMood = mood;
    }
  });

  return { moodCounts, topMood, totalEntries: moods.length };
};

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { moods } = useMoodStore();
  const [weeklyReports, setWeeklyReports] = useState<MoodReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MoodReport[]>([]);

  // Load reports from LocalStorage
  const fetchReports = useCallback(() => {
    if (!user) return;
    
    try {
      // Load weekly reports
      const allWeeklyReports: MoodReport[] = SecureStorage.getItem(DB_WEEKLY_REPORTS_KEY) || [];
      const userWeeklyReports = allWeeklyReports.filter(r => r.userId === user.id);
      setWeeklyReports(userWeeklyReports);
      
      // Load monthly reports
      const allMonthlyReports: MoodReport[] = SecureStorage.getItem(DB_MONTHLY_REPORTS_KEY) || [];
      const userMonthlyReports = allMonthlyReports.filter(r => r.userId === user.id);
      setMonthlyReports(userMonthlyReports);
    } catch (e) {
      console.error("Failed to load reports", e);
    }
  }, [user]);

  // Initial Fetch
  useEffect(() => {
    if (user) {
      fetchReports();
    } else {
      setWeeklyReports([]);
      setMonthlyReports([]);
    }
  }, [user, fetchReports]);

  const saveWeeklyReports = useCallback((reports: MoodReport[]) => {
    if (!user) return;
    
    try {
      let allReports: MoodReport[] = SecureStorage.getItem(DB_WEEKLY_REPORTS_KEY) || [];
      
      // Remove current user's reports
      allReports = allReports.filter(r => r.userId !== user.id);
      
      // Add updated reports
      allReports = [...allReports, ...reports];
      
      SecureStorage.setItem(DB_WEEKLY_REPORTS_KEY, allReports);
    } catch (e) {
      console.error("Failed to save weekly reports", e);
    }
  }, [user]);

  const saveMonthlyReports = useCallback((reports: MoodReport[]) => {
    if (!user) return;
    
    try {
      let allReports: MoodReport[] = SecureStorage.getItem(DB_MONTHLY_REPORTS_KEY) || [];
      
      // Remove current user's reports
      allReports = allReports.filter(r => r.userId !== user.id);
      
      // Add updated reports
      allReports = [...allReports, ...reports];
      
      SecureStorage.setItem(DB_MONTHLY_REPORTS_KEY, allReports);
    } catch (e) {
      console.error("Failed to save monthly reports", e);
    }
  }, [user]);

  // Generate Weekly Report Logic
  const generateWeeklyReport = useCallback((date: Date, currentReports: MoodReport[]) => {
    if (!user) return null;

    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    
    // Check if report already exists for this week
    const existingReport = currentReports.find(report => 
      isSameWeek(new Date(report.startDate), date, { weekStartsOn: 1 })
    );

    if (existingReport) return null;

    // Filter moods for this week
    const weeklyMoods = moods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      return moodDate >= weekStart && moodDate <= weekEnd;
    });
    
    if (weeklyMoods.length > 0) {
      const scores = weeklyMoods.map(m => MOOD_CONFIGS[m.mood].score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const { moodCounts, topMood, totalEntries } = calculateMoodStats(weeklyMoods);
      
      const newReport: MoodReport = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'weekly',
        startDate: weekStart,
        endDate: weekEnd,
        minScore: parseFloat(minScore.toFixed(1)),
        maxScore: parseFloat(maxScore.toFixed(1)),
        avgScore: parseFloat(avgScore.toFixed(1)),
        userId: user.id,
        createdAt: Date.now(),
        totalEntries,
        topMood,
        moodCounts
      };
      
      return newReport;
    }
    return null;
  }, [user, moods]);

  // Generate Monthly Report Logic
  const generateMonthlyReport = useCallback((date: Date, currentReports: MoodReport[]) => {
    if (!user) return null;

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    // Check if report already exists for this month
    const existingReport = currentReports.find(report => 
      isSameMonth(new Date(report.startDate), date)
    );

    if (existingReport) return null;

    // Filter moods for this month
    const monthlyMoods = moods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      return moodDate >= monthStart && moodDate <= monthEnd;
    });
    
    if (monthlyMoods.length > 0) {
      const scores = monthlyMoods.map(m => MOOD_CONFIGS[m.mood].score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const { moodCounts, topMood, totalEntries } = calculateMoodStats(monthlyMoods);
      
      const newReport: MoodReport = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'monthly',
        startDate: monthStart,
        endDate: monthEnd,
        minScore: parseFloat(minScore.toFixed(1)),
        maxScore: parseFloat(maxScore.toFixed(1)),
        avgScore: parseFloat(avgScore.toFixed(1)),
        userId: user.id,
        createdAt: Date.now(),
        totalEntries,
        topMood,
        moodCounts
      };
      
      return newReport;
    }
    return null;
  }, [user, moods]);


  // Check and generate reports
  useEffect(() => {
    if (!user || moods.length === 0) return;

    const checkAndGenerateReports = () => {
      const now = new Date();
      let newWeeklyReports: MoodReport[] = [];
      let newMonthlyReports: MoodReport[] = [];

      // 1. Check Previous Week (Catch-up)
      // If we are past the end of last week, and no report exists, generate it.
      // Last week's end is Sunday.
      const lastWeekDate = subWeeks(now, 1);
      const reportForLastWeek = generateWeeklyReport(lastWeekDate, weeklyReports);
      if (reportForLastWeek) {
        newWeeklyReports.push(reportForLastWeek);
      }

      // 2. Check Current Week
      // If today is Sunday and past 12:00 PM
      if (isSunday(now) && now.getHours() >= 12) {
        const reportForThisWeek = generateWeeklyReport(now, [...weeklyReports, ...newWeeklyReports]);
        if (reportForThisWeek) {
          newWeeklyReports.push(reportForThisWeek);
        }
      }

      // 3. Check Previous Month (Catch-up)
      const lastMonthDate = subMonths(now, 1);
      const reportForLastMonth = generateMonthlyReport(lastMonthDate, monthlyReports);
      if (reportForLastMonth) {
        newMonthlyReports.push(reportForLastMonth);
      }

      // 4. Check Current Month
      // If today is last day of month and past 12:00 PM
      if (isLastDayOfMonth(now) && now.getHours() >= 12) {
        const reportForThisMonth = generateMonthlyReport(now, [...monthlyReports, ...newMonthlyReports]);
        if (reportForThisMonth) {
          newMonthlyReports.push(reportForThisMonth);
        }
      }

      // Batch update state and storage
      if (newWeeklyReports.length > 0) {
        const updated = [...newWeeklyReports, ...weeklyReports];
        // Remove duplicates by ID just in case
        const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
        setWeeklyReports(unique);
        saveWeeklyReports(unique);
      }

      if (newMonthlyReports.length > 0) {
        const updated = [...newMonthlyReports, ...monthlyReports];
        const unique = Array.from(new Map(updated.map(item => [item.id, item])).values());
        setMonthlyReports(unique);
        saveMonthlyReports(unique);
      }
    };

    // Run immediately
    checkAndGenerateReports();

    // Run every hour
    const interval = setInterval(checkAndGenerateReports, 60 * 60 * 1000);
    return () => clearInterval(interval);

  }, [user, moods, weeklyReports, monthlyReports, generateWeeklyReport, generateMonthlyReport, saveWeeklyReports, saveMonthlyReports]);

  const deleteWeeklyReport = useCallback((id: string) => {
    if (!user) return;
    
    const updatedReports = weeklyReports.filter(report => report.id !== id);
    setWeeklyReports(updatedReports);
    saveWeeklyReports(updatedReports);
  }, [user, weeklyReports, saveWeeklyReports]);

  const deleteMonthlyReport = useCallback((id: string) => {
    if (!user) return;
    
    const updatedReports = monthlyReports.filter(report => report.id !== id);
    setMonthlyReports(updatedReports);
    saveMonthlyReports(updatedReports);
  }, [user, monthlyReports, saveMonthlyReports]);

  return (
    <ReportContext.Provider value={{ 
      weeklyReports, 
      monthlyReports,
      deleteWeeklyReport,
      deleteMonthlyReport
    }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReportStore = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReportStore must be used within a ReportProvider');
  return context;
};
