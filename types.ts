export enum MoodType {
  HAPPY = 'happy',
  CALM = 'calm',
  NEUTRAL = 'neutral',
  TIRED = 'tired',
  SAD = 'sad',
  ANNOYED = 'annoyed',
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  location: string;
  activity: string;
  mood: MoodType;
  photoUrl?: string;
  note?: string;
  userId?: string; // Linked to user
  tags?: string[]; // 心情标签
}

export interface MoodConfig {
  label: string;
  score: number; // For the chart
  color: string;
  iconName: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // In a real app, never store plain text!
  avatar?: string;
  createdAt: number;
}

// 报告类型
export interface MoodReport {
  id: string;
  type: 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  minScore: number;
  maxScore: number;
  avgScore: number;
  userId: string;
  createdAt: number;
  totalEntries: number; // 总记录数
  topMood: MoodType | null; // 出现次数最多的心情
  moodCounts: Record<MoodType, number>; // 各心情计数
  content?: string; // 个性化内容描述
  insights?: {
    trendSummary: string; // 情绪趋势总结
    frequentActivity: string; // 高频活动识别
    moodDistribution: string; // 情绪分布概览
  };
}

// 情绪急救箱项目
export interface EmergencyKitItem {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'movement' | 'mindfulness' | 'self-care' | 'custom';
  duration?: number; // 建议时长（分钟）
  isCustom?: boolean;
}