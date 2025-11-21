import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MoodReport } from '../types';
import { useAuth } from './AuthContext';
import { useMoodStore } from './MoodContext';
import { MOOD_CONFIGS } from '../constants';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameWeek, isSameMonth, format, isSunday, isLastDayOfMonth } from 'date-fns';
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
      const weeklyReportsJson = localStorage.getItem(DB_WEEKLY_REPORTS_KEY);
      const allWeeklyReports: MoodReport[] = weeklyReportsJson ? JSON.parse(weeklyReportsJson) : [];
      const userWeeklyReports = allWeeklyReports.filter(r => r.userId === user.id);
      setWeeklyReports(userWeeklyReports);
      
      // Load monthly reports
      const monthlyReportsJson = localStorage.getItem(DB_MONTHLY_REPORTS_KEY);
      const allMonthlyReports: MoodReport[] = monthlyReportsJson ? JSON.parse(monthlyReportsJson) : [];
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

  // Auto-generate weekly reports
  useEffect(() => {
    if (!user) return;

    const generateWeeklyReportIfNeeded = () => {
      const now = new Date();
      // Check if today is Sunday and past 12:00 PM
      if (isSunday(now) && now.getHours() >= 12) {
        // Check if a report for this week already exists
        const existingReport = weeklyReports.find(report => 
          isSameWeek(new Date(report.startDate), now, { weekStartsOn: 1 })
        );
        
        if (!existingReport) {
          // Get the current week range
          const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
          
          // Filter moods for this week
          const weeklyMoods = moods.filter(mood => {
            const moodDate = new Date(mood.timestamp);
            return moodDate >= weekStart && moodDate <= weekEnd;
          });
          
          if (weeklyMoods.length > 0) {
            // Calculate statistics
            const scores = weeklyMoods.map(m => MOOD_CONFIGS[m.mood].score);
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            // Create new report
            const newReport: MoodReport = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              type: 'weekly',
              startDate: weekStart,
              endDate: weekEnd,
              minScore: parseFloat(minScore.toFixed(1)),
              maxScore: parseFloat(maxScore.toFixed(1)),
              avgScore: parseFloat(avgScore.toFixed(1)),
              userId: user.id,
              createdAt: Date.now()
            };
            
            const updatedReports = [newReport, ...weeklyReports];
            setWeeklyReports(updatedReports);
            saveWeeklyReports(updatedReports);
          }
        }
      }
    };

    // Run once on mount
    generateWeeklyReportIfNeeded();

    // Check every hour
    const interval = setInterval(generateWeeklyReportIfNeeded, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, moods, weeklyReports]);

  // Auto-generate monthly reports
  useEffect(() => {
    if (!user) return;

    const generateMonthlyReportIfNeeded = () => {
      const now = new Date();
      // Check if today is the last day of the month and past 12:00 PM
      if (isLastDayOfMonth(now) && now.getHours() >= 12) {
        // Check if a report for this month already exists
        const existingReport = monthlyReports.find(report => 
          isSameMonth(new Date(report.startDate), now)
        );
        
        if (!existingReport) {
          // Get the current month range
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);
          
          // Filter moods for this month
          const monthlyMoods = moods.filter(mood => {
            const moodDate = new Date(mood.timestamp);
            return moodDate >= monthStart && moodDate <= monthEnd;
          });
          
          if (monthlyMoods.length > 0) {
            // Calculate statistics
            const scores = monthlyMoods.map(m => MOOD_CONFIGS[m.mood].score);
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            // Create new report
            const newReport: MoodReport = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              type: 'monthly',
              startDate: monthStart,
              endDate: monthEnd,
              minScore: parseFloat(minScore.toFixed(1)),
              maxScore: parseFloat(maxScore.toFixed(1)),
              avgScore: parseFloat(avgScore.toFixed(1)),
              userId: user.id,
              createdAt: Date.now()
            };
            
            const updatedReports = [newReport, ...monthlyReports];
            setMonthlyReports(updatedReports);
            saveMonthlyReports(updatedReports);
          }
        }
      }
    };

    // Run once on mount
    generateMonthlyReportIfNeeded();

    // Check every hour
    const interval = setInterval(generateMonthlyReportIfNeeded, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, moods, monthlyReports]);

  const saveWeeklyReports = useCallback((reports: MoodReport[]) => {
    if (!user) return;
    
    try {
      const allReportsJson = localStorage.getItem(DB_WEEKLY_REPORTS_KEY);
      let allReports: MoodReport[] = allReportsJson ? JSON.parse(allReportsJson) : [];
      
      // Remove current user's reports
      allReports = allReports.filter(r => r.userId !== user.id);
      
      // Add updated reports
      allReports = [...allReports, ...reports];
      
      localStorage.setItem(DB_WEEKLY_REPORTS_KEY, JSON.stringify(allReports));
    } catch (e) {
      console.error("Failed to save weekly reports", e);
    }
  }, [user]);

  const saveMonthlyReports = useCallback((reports: MoodReport[]) => {
    if (!user) return;
    
    try {
      const allReportsJson = localStorage.getItem(DB_MONTHLY_REPORTS_KEY);
      let allReports: MoodReport[] = allReportsJson ? JSON.parse(allReportsJson) : [];
      
      // Remove current user's reports
      allReports = allReports.filter(r => r.userId !== user.id);
      
      // Add updated reports
      allReports = [...allReports, ...reports];
      
      localStorage.setItem(DB_MONTHLY_REPORTS_KEY, JSON.stringify(allReports));
    } catch (e) {
      console.error("Failed to save monthly reports", e);
    }
  }, [user]);

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