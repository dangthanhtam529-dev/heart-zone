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

// Helper to calculate activity statistics
const calculateActivityStats = (moods: any[]) => {
  const activityCounts: Record<string, number> = {};

  moods.forEach(mood => {
    if (mood.activity && mood.activity !== '发呆') {
      activityCounts[mood.activity] = (activityCounts[mood.activity] || 0) + 1;
    }
  });

  let mostFrequentActivity = '发呆';
  let maxActivityCount = 0;

  Object.entries(activityCounts).forEach(([activity, count]) => {
    if (count > maxActivityCount) {
      maxActivityCount = count;
      mostFrequentActivity = activity;
    }
  });

  return mostFrequentActivity;
};

// Helper to calculate mood distribution
const calculateMoodDistribution = (moodCounts: Record<MoodType, number>, totalEntries: number) => {
  if (totalEntries === 0) {
    return { positive: 0, negative: 0 };
  }

  // Positive moods: HAPPY, CALM
  const positiveCount = moodCounts[MoodType.HAPPY] + moodCounts[MoodType.CALM];
  // Negative moods: TIRED, SAD, ANNOYED
  const negativeCount = moodCounts[MoodType.TIRED] + moodCounts[MoodType.SAD] + moodCounts[MoodType.ANNOYED];
  // Neutral is neither positive nor negative

  return {
    positive: parseFloat(((positiveCount / totalEntries) * 100).toFixed(0)),
    negative: parseFloat(((negativeCount / totalEntries) * 100).toFixed(0))
  };
};

// Helper to calculate trend summary
const calculateTrendSummary = (currentAvg: number, previousAvg: number, reportType: 'weekly' | 'monthly') => {
  // 不再使用previousAvg === 0来判断是否是第一份报告，因为这会导致周报和月报互相影响
  // 而是根据reportType返回不同的趋势描述
  const difference = currentAvg - previousAvg;
  const percentageChange = previousAvg !== 0 ? (difference / previousAvg) * 100 : 0;

  if (percentageChange > 10) {
    return `${reportType === 'weekly' ? '本周' : '本月'}你的心情总体呈上升趋势，继续保持哦！`;
  } else if (percentageChange < -10) {
    return `${reportType === 'weekly' ? '本周' : '本月'}你的心情总体呈下降趋势，记得照顾好自己！`;
  } else {
    return `${reportType === 'weekly' ? '本周' : '本月'}你的心情总体呈平稳趋势，保持内心的宁静！`;
  }
};

// 智能周报内容生成器
const generatePersonalizedWeeklyContent = (
  avgScore: number,
  topMood: MoodType | null,
  moodCounts: Record<MoodType, number>,
  totalEntries: number,
  username: string
): string => {
  
  // 计算各种情绪占比
  const positiveCount = moodCounts[MoodType.HAPPY] + moodCounts[MoodType.CALM];
  const negativeCount = moodCounts[MoodType.TIRED] + moodCounts[MoodType.SAD] + moodCounts[MoodType.ANNOYED];
  const neutralCount = moodCounts[MoodType.NEUTRAL];
  
  const positiveRatio = totalEntries > 0 ? (positiveCount / totalEntries) * 100 : 0;
  const negativeRatio = totalEntries > 0 ? (negativeCount / totalEntries) * 100 : 0;
  const neutralRatio = totalEntries > 0 ? (neutralCount / totalEntries) * 100 : 0;
  
  // 根据主导情绪和平均分生成个性化内容
  const contentTemplates = {
    highEnergy: [
      `${username}，这周您的状态像阳光一样灿烂！${moodCounts[MoodType.HAPPY]}次开心记录让您整个人都散发着温暖的光芒。`,
      `太棒了！这周您有${positiveRatio.toFixed(0)}%的时间都保持着积极心态，这种正能量会感染身边的每一个人。`,
      `${moodCounts[MoodType.HAPPY]}次开心的记录，就像${moodCounts[MoodType.HAPPY]}颗星星点亮了您的生活，继续保持这份美好的心情吧！`
    ],
    balanced: [
      `${username}，这周您的心情比较平稳，就像湖面上的小舟，虽有微风但不失方向。`,
      `${totalEntries}次记录中，${positiveRatio.toFixed(0)}%是积极情绪，${neutralRatio.toFixed(0)}%是中性状态，这种平衡感本身就是一种智慧。`,
      `生活就像调色盘，这周您用${Object.keys(moodCounts).filter(mood => moodCounts[mood as MoodType] > 0).length}种不同的情绪色彩，绘制出了属于自己的独特画卷。`
    ],
    challenging: [
      `${username}，这周可能有些艰难，但您依然坚持记录心情，这份自我觉察的勇气值得赞赏。`,
      `${negativeRatio.toFixed(0)}%的时间感到低落，但请记住，情绪就像天气，阴云终将散去，阳光总会到来。`,
      `这周${moodCounts[MoodType.SAD] || 0}次难过，${moodCounts[MoodType.TIRED] || 0}次疲惫，但每一次记录都是对自己的关爱，这就是成长的痕迹。`
    ],
    mixed: [
      `${username}，这周您经历了情绪的过山车，从高到低，从平静到激动，这种丰富的情感体验让生活更加真实。`,
      `${positiveRatio.toFixed(0)}%的积极时光，${negativeRatio.toFixed(0)}%的挑战时刻，${neutralRatio.toFixed(0)}%的平静时光，这就是生活的真实写照。`,
      `这周的情绪变化就像心电图，有高峰也有低谷，但正是这样的波动证明了您鲜活的生命力。`
    ]
  };
  
  // 根据数据选择合适的内容类型
  let contentType = 'mixed';
  
  if (positiveRatio >= 70) {
    contentType = 'highEnergy';
  } else if (negativeRatio >= 60) {
    contentType = 'challenging';
  } else if (Math.abs(positiveRatio - negativeRatio) <= 20 && neutralRatio >= 30) {
    contentType = 'balanced';
  }
  
  // 根据主导情绪进一步个性化
  if (topMood) {
    const topMoodSpecific = {
      [MoodType.HAPPY]: `开心是您这周的主旋律，就像阳光穿透云层，温暖而明亮。`,
      [MoodType.CALM]: `平静是您这周的主调，如湖水般宁静，这种内心的平和是最珍贵的财富。`,
      [MoodType.NEUTRAL]: `中性状态居多，就像人生的常态，平淡中蕴含着生活的真谛。`,
      [MoodType.TIRED]: `疲惫感较多，提醒您需要更多休息，好好照顾自己是当下的重要任务。`,
      [MoodType.SAD]: `难过情绪较多，但请记住表达悲伤也是勇气，您并不孤单。`,
      [MoodType.ANNOYED]: `烦躁感时有出现，可能是压力的信号，找到适合自己的释放方式很重要。`
    };
    
    const templates = contentTemplates[contentType as keyof typeof contentTemplates];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return `${randomTemplate} ${topMoodSpecific[topMood]}`;
  }
  
  const templates = contentTemplates[contentType as keyof typeof contentTemplates];
  return templates[Math.floor(Math.random() * templates.length)];
};

// 智能月报内容生成器
const generatePersonalizedMonthlyContent = (
  avgScore: number,
  topMood: MoodType | null,
  moodCounts: Record<MoodType, number>,
  totalEntries: number,
  username: string
): string => {
  
  const positiveCount = moodCounts[MoodType.HAPPY] + moodCounts[MoodType.CALM];
  const negativeCount = moodCounts[MoodType.TIRED] + moodCounts[MoodType.SAD] + moodCounts[MoodType.ANNOYED];
  const neutralCount = moodCounts[MoodType.NEUTRAL];
  
  const positiveRatio = totalEntries > 0 ? (positiveCount / totalEntries) * 100 : 0;
  const negativeRatio = totalEntries > 0 ? (negativeCount / totalEntries) * 100 : 0;
  const neutralRatio = totalEntries > 0 ? (neutralCount / totalEntries) * 100 : 0;
  
  // 月度深度分析
  const mostFrequentMood = Object.entries(moodCounts)
    .filter(([,count]) => count > 0)
    .sort(([,a], [,b]) => b - a)[0] || [MoodType.NEUTRAL, 0]; // 默认值避免undefined
  
  const moodTrend = avgScore >= 4 ? '积极' : avgScore >= 3 ? '平稳' : '挑战';
  
  // 计算情绪稳定性（标准差概念简化版）
  const moodVariety = Object.values(moodCounts).filter(count => count > 0).length;
  const stability = moodVariety <= 3 ? '稳定' : moodVariety <= 5 ? '适中' : '丰富';
  
  // 计算每周平均记录数
  const avgWeeklyEntries = totalEntries > 0 ? Math.round(totalEntries / 4.3) : 0;
  
  const monthlyTemplates = {
    excellent: [
      `${username}，这个月您的心情如春日暖阳般灿烂！${moodCounts[MoodType.HAPPY]}次开心记录像${moodCounts[MoodType.HAPPY]}朵鲜花，为您的生活增添了无尽色彩。`,
      `太棒了！这个月${positiveRatio.toFixed(0)}%的时间都充满正能量，您用${totalEntries}次记录证明了自己的心理韧性，这种阳光心态是最好的财富。`,
      `数据显示这个月您以${MOOD_CONFIGS[mostFrequentMood[0] as MoodType].label}为主，这种持续的好状态就像找到了生活的金钥匙，愿这份美好一直延续下去。`
    ],
    positive: [
      `${username}，这个月您用${positiveCount}次积极情绪，为生活谱写了温暖的乐章，就像夜空中最亮的星，指引着前进的方向。`,
      `${totalEntries}次心情记录中，积极情绪占比${positiveRatio.toFixed(0)}%，这种乐观的态度就像春风化雨，滋润着每一天的生活。`,
      `回顾这个月，${mostFrequentMood[1]}次${MOOD_CONFIGS[mostFrequentMood[0] as MoodType].label}情绪成为主旋律，您正在用自己的方式诠释着生活的美好。`
    ],
    balanced: [
      `${username}，这个月您展现了难得的情绪平衡感，${neutralRatio.toFixed(0)}%的中性状态说明您学会了在纷繁复杂中保持内心的宁静。`,
      `就像太极的阴阳平衡，这个月您经历了各种情绪却依然保持稳定，这种${stability}的情绪模式是成熟心智的体现。`,
      `${totalEntries}次记录展现了您丰富的情感世界，从开心到平静，每一种情绪都是生活authentic的颜色，构成了独特的月度画卷。`
    ],
    growth: [
      `${username}，这个月虽有挑战，但您用${totalEntries}次记录展现了面对困难的勇气，每一次自我觉察都是成长的见证。`,
      `情绪趋势显示为${moodTrend}，但请记住，就像树木需要风雨才能扎根，这个月的${negativeRatio.toFixed(0)}%挑战时光也是生命的养分。`,
      `这个月您经历了情绪的高低起伏，但正是这些经历让您更加了解自己，就像璞玉需要雕琢，您正在变得更加坚韧和睿智。`
    ],
    reflective: [
      `${username}，这个月${avgWeeklyEntries}次的平均周记录频率，说明您对自我关怀的重视，这种坚持本身就是最美的风景。`,
      `回望这一个月的${totalEntries}个瞬间，您会发现情绪就像月亮的阴晴圆缺，是自然的变化规律，而您学会了欣赏每一种状态。`,
      `${mostFrequentMood[1]}次${MOOD_CONFIGS[mostFrequentMood[0] as MoodType].label}，${moodVariety}种不同情绪，这个月您用真实记录证明：接纳自己就是最大的成长。`
    ]
  };
  
  // 季节性分析（简化版）
  const currentMonth = new Date().getMonth() + 1;
  const seasonText = currentMonth >= 3 && currentMonth <= 5 ? '春天' : 
                    currentMonth >= 6 && currentMonth <= 8 ? '夏天' : 
                    currentMonth >= 9 && currentMonth <= 11 ? '秋天' : '冬天';
  
  // 选择合适的内容类型
  let contentType = 'reflective';
  
  if (positiveRatio >= 70) {
    contentType = 'excellent';
  } else if (positiveRatio >= 55) {
    contentType = 'positive';
  } else if (Math.abs(positiveRatio - negativeRatio) <= 15 && neutralRatio >= 35) {
    contentType = 'balanced';
  } else if (negativeRatio >= 45) {
    contentType = 'growth';
  }
  
  // 添加季节性元素
  const seasonalElements = {
    spring: '就像春天的万物复苏，',
    summer: '如同夏日的热情阳光，',
    autumn: '恰似秋天的收获季节，',
    winter: '正如冬日的宁静致远，'
  };
  
  const templates = monthlyTemplates[contentType as keyof typeof monthlyTemplates];
  let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // 根据记录频率添加个性化建议
  let frequencyAdvice = '';
  if (avgWeeklyEntries >= 10) {
    frequencyAdvice = '您保持着高频的记录习惯，这种坚持让自我觉察成为了生活的一部分。';
  } else if (avgWeeklyEntries >= 5) {
    frequencyAdvice = '适中的记录频率让您既能关注内心，又不会感到负担，这是很好的平衡。';
  } else if (totalEntries > 0) {
    frequencyAdvice = '虽然记录不多，但每一次都是珍贵的自我对话，慢慢来会更好。';
  }
  
  // 组合最终内容
  selectedTemplate = `${seasonalElements[seasonText as keyof typeof seasonalElements]}${selectedTemplate}`;
  if (frequencyAdvice && Math.random() > 0.5) { // 50%概率添加频率建议
    selectedTemplate = `${selectedTemplate} ${frequencyAdvice}`;
  }
  
  return selectedTemplate;
};

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { moods } = useMoodStore();
  const [weeklyReports, setWeeklyReports] = useState<MoodReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MoodReport[]>([]);

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

  // Load reports from LocalStorage
  const fetchReports = useCallback(() => {
    if (!user) return;
    
    try {
      // Load weekly reports
      const allWeeklyReports: MoodReport[] = SecureStorage.getItem(DB_WEEKLY_REPORTS_KEY) || [];
      const userWeeklyReports = allWeeklyReports.filter(r => r.userId === user.id);
      
      // Update old weekly reports to fix "first report" issue
      const updatedWeeklyReports = userWeeklyReports.map(report => {
        // Always recalculate trend summary for all weekly reports to ensure consistency
        const reportDate = new Date(report.startDate);
        const prevWeekStart = startOfWeek(subWeeks(reportDate, 1), { weekStartsOn: 1 });
        const prevWeekEnd = endOfWeek(subWeeks(reportDate, 1), { weekStartsOn: 1 });
        const prevWeeklyMoods = moods.filter(mood => {
          const moodDate = new Date(mood.timestamp);
          return moodDate >= prevWeekStart && moodDate <= prevWeekEnd;
        });
        const prevWeekAvgScore = prevWeeklyMoods.length > 0 
          ? prevWeeklyMoods.reduce((a, b) => a + MOOD_CONFIGS[b.mood].score, 0) / prevWeeklyMoods.length
          : 0;
        
        return {
          ...report,
          insights: {
            ...report.insights,
            trendSummary: calculateTrendSummary(report.avgScore, prevWeekAvgScore, 'weekly')
          }
        };
      });
      
      setWeeklyReports(updatedWeeklyReports);
      
      // Load monthly reports
      const allMonthlyReports: MoodReport[] = SecureStorage.getItem(DB_MONTHLY_REPORTS_KEY) || [];
      const userMonthlyReports = allMonthlyReports.filter(r => r.userId === user.id);
      
      // Update old monthly reports to fix "first report" issue
      const updatedMonthlyReports = userMonthlyReports.map(report => {
        // Always recalculate trend summary for all monthly reports to ensure consistency
        const reportDate = new Date(report.startDate);
        const prevMonthStart = startOfMonth(subMonths(reportDate, 1));
        const prevMonthEnd = endOfMonth(subMonths(reportDate, 1));
        const prevMonthlyMoods = moods.filter(mood => {
          const moodDate = new Date(mood.timestamp);
          return moodDate >= prevMonthStart && moodDate <= prevMonthEnd;
        });
        const prevMonthAvgScore = prevMonthlyMoods.length > 0 
          ? prevMonthlyMoods.reduce((a, b) => a + MOOD_CONFIGS[b.mood].score, 0) / prevMonthlyMoods.length
          : 0;
        
        return {
          ...report,
          insights: {
            ...report.insights,
            trendSummary: calculateTrendSummary(report.avgScore, prevMonthAvgScore, 'monthly')
          }
        };
      });
      
      setMonthlyReports(updatedMonthlyReports);
      
      // Save the updated reports back to storage
      saveWeeklyReports(updatedWeeklyReports);
      saveMonthlyReports(updatedMonthlyReports);
    } catch (e) {
      console.error("Failed to load reports", e);
    }
  }, [user, moods, saveWeeklyReports, saveMonthlyReports]);

  // Initial Fetch
  useEffect(() => {
    if (user) {
      fetchReports();
    } else {
      setWeeklyReports([]);
      setMonthlyReports([]);
    }
  }, [user, fetchReports]);

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
      
      // 生成个性化周报内容
      const personalizedContent = generatePersonalizedWeeklyContent(
        avgScore,
        topMood,
        moodCounts,
        totalEntries,
        user.username || '用户'
      );

      // 计算前一周的平均分数
      const prevWeekStart = startOfWeek(subWeeks(date, 1), { weekStartsOn: 1 });
      const prevWeekEnd = endOfWeek(subWeeks(date, 1), { weekStartsOn: 1 });
      const prevWeeklyMoods = moods.filter(mood => {
        const moodDate = new Date(mood.timestamp);
        return moodDate >= prevWeekStart && moodDate <= prevWeekEnd;
      });
      const prevWeekAvgScore = prevWeeklyMoods.length > 0 
        ? prevWeeklyMoods.reduce((a, b) => a + MOOD_CONFIGS[b.mood].score, 0) / prevWeeklyMoods.length
        : 0;

      // 生成智能洞察
      const distribution = calculateMoodDistribution(moodCounts, totalEntries);
      const insights = {
        trendSummary: calculateTrendSummary(avgScore, prevWeekAvgScore, 'weekly'),
        frequentActivity: calculateActivityStats(weeklyMoods),
        moodDistribution: `本周积极情绪占${distribution.positive}%，需要关注的情绪占${distribution.negative}%`
      };

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
        moodCounts,
        content: personalizedContent, // 添加个性化内容
        insights // 添加智能洞察
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
      
      // 生成个性化月报内容
      const personalizedContent = generatePersonalizedMonthlyContent(
        avgScore,
        topMood,
        moodCounts,
        totalEntries,
        user.username || '用户'
      );

      // 计算前一月的平均分数
      const prevMonthStart = startOfMonth(subMonths(date, 1));
      const prevMonthEnd = endOfMonth(subMonths(date, 1));
      const prevMonthlyMoods = moods.filter(mood => {
        const moodDate = new Date(mood.timestamp);
        return moodDate >= prevMonthStart && moodDate <= prevMonthEnd;
      });
      const prevMonthAvgScore = prevMonthlyMoods.length > 0 
        ? prevMonthlyMoods.reduce((a, b) => a + MOOD_CONFIGS[b.mood].score, 0) / prevMonthlyMoods.length
        : 0;

      // 生成智能洞察
      const distribution = calculateMoodDistribution(moodCounts, totalEntries);
      const insights = {
        trendSummary: calculateTrendSummary(avgScore, prevMonthAvgScore, 'monthly'),
        frequentActivity: calculateActivityStats(monthlyMoods),
        moodDistribution: `本月积极情绪占${distribution.positive}%，需要关注的情绪占${distribution.negative}%`
      };

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
        moodCounts,
        content: personalizedContent, // 添加个性化内容
        insights // 添加智能洞察
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
