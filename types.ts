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