
import { MoodType, MoodConfig } from './types';
import { Smile, Sunset, Meh, BatteryLow, Frown, Zap } from 'lucide-react';

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  [MoodType.HAPPY]: { label: '开心', score: 5, color: 'bg-orange-100 text-orange-700', iconName: 'Smile' },
  [MoodType.CALM]: { label: '平静', score: 4, color: 'bg-stone-200 text-stone-700', iconName: 'Sunset' },
  [MoodType.NEUTRAL]: { label: '一般', score: 3, color: 'bg-gray-100 text-gray-600', iconName: 'Meh' },
  [MoodType.TIRED]: { label: '疲惫', score: 2, color: 'bg-violet-100 text-violet-600', iconName: 'BatteryLow' },
  [MoodType.SAD]: { label: '难过', score: 1, color: 'bg-blue-50 text-blue-500', iconName: 'Frown' },
  [MoodType.ANNOYED]: { label: '烦躁', score: 1, color: 'bg-rose-100 text-rose-600', iconName: 'Zap' },
};

export const NEGATIVE_MOODS = [MoodType.TIRED, MoodType.SAD, MoodType.ANNOYED];
export const POSITIVE_MOODS = [MoodType.HAPPY, MoodType.CALM];

// Helper to get icon component
export const getMoodIcon = (type: MoodType) => {
  switch (type) {
    case MoodType.HAPPY: return Smile;
    case MoodType.CALM: return Sunset;
    case MoodType.NEUTRAL: return Meh;
    case MoodType.TIRED: return BatteryLow;
    case MoodType.SAD: return Frown;
    case MoodType.ANNOYED: return Zap;
    default: return Meh;
  }
};
