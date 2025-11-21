import React, { useState } from 'react';
import { useMoodStore } from '../context/MoodContext';
import { useReportStore } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { MoodCard } from '../components/MoodCard';
import { Link } from 'react-router-dom';
import { Ghost, Trash2, Heart } from 'lucide-react';

export const MoodList: React.FC = () => {
  const { moods, deleteMood } = useMoodStore();
  const { user } = useAuth();
  const { 
    weeklyReports, 
    monthlyReports, 
    deleteWeeklyReport, 
    deleteMonthlyReport 
  } = useReportStore();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'weekly' | 'monthly' | 'heartsea' | null>(null);

  return (
    <div className="p-6 pt-12 min-h-screen">
      <header className="flex justify-between items-end mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">心域足迹</h1>
          <p className="text-stone-500 text-sm mt-1">
            {activeTab === 'cards' && `共记录 ${moods.length} 次心情`}
            {activeTab === 'weekly' && `共 ${weeklyReports.length} 份周报`}
            {activeTab === 'monthly' && `共 ${monthlyReports.length} 份月报`}
            {activeTab === 'heartsea' && `心海`}
          </p>
        </div>
      </header>

      {/* 功能标签 */}
      <div className="space-y-3 mb-6">
        <button 
          onClick={() => setActiveTab('cards')}
          className={`w-full text-left p-4 rounded-2xl transition-all ${
            activeTab === 'cards' 
              ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
              : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
          }`}
        >
          心情卡片管理
        </button>
        
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`w-full text-left p-4 rounded-2xl transition-all ${
            activeTab === 'weekly' 
              ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
              : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
          }`}
        >
          心情周报
        </button>
        
        <button 
          onClick={() => setActiveTab('monthly')}
          className={`w-full text-left p-4 rounded-2xl transition-all ${
            activeTab === 'monthly' 
              ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
              : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
          }`}
        >
          心情月报
        </button>

        <button 
          onClick={() => setActiveTab('heartsea')}
          className={`w-full text-left p-4 rounded-2xl transition-all ${
            activeTab === 'heartsea' 
              ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
              : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
          }`}
        >
          心海
        </button>
      </div>

      {activeTab === 'cards' && (
        moods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400 animate-fade-in">
            <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
              <Ghost size={56} strokeWidth={1.5} />
            </div>
            <p className="mb-6 text-lg font-medium text-stone-500">这里还是一片荒原</p>
            <Link to="/" className="bg-white border border-stone-200 px-6 py-2.5 rounded-xl text-stone-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm">
              去种下第一颗种子
            </Link>
          </div>
        ) : (
          <div className="space-y-5 pb-20 animate-slide-up">
            {moods.map((entry) => (
              <MoodCard key={entry.id} entry={entry} onDelete={deleteMood} />
            ))}
          </div>
        )
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-5 pb-20 animate-slide-up">
          {weeklyReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400 animate-fade-in">
              <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
                <Ghost size={56} strokeWidth={1.5} />
              </div>
              <p className="mb-6 text-lg font-medium text-stone-500">暂无周报</p>
              <p className="text-stone-400 text-sm text-center px-8">
                每周日中午12点会自动生成周报
              </p>
            </div>
          ) : (
            [...weeklyReports]
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((report) => (
                <div key={report.id} className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 hover:shadow-[0_4px_20px_rgba(251,146,60,0.1)] transition-all duration-300 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-stone-700 text-lg tracking-tight">第{getWeekNumber(new Date(report.startDate))}周心情报告</h3>
                    <button 
                      onClick={() => deleteWeeklyReport(report.id)}
                      className="text-stone-300 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {user?.username || '用户'}您好，{new Date(report.startDate).getFullYear()}年{new Date(report.startDate).getMonth() + 1}月的第{getWeekNumber(new Date(report.startDate))}周快要过去了，您本周心情平均值为{report.avgScore}，希望您下周过得更好
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-5 pb-20 animate-slide-up">
          {monthlyReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400 animate-fade-in">
              <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
                <Ghost size={56} strokeWidth={1.5} />
              </div>
              <p className="mb-6 text-lg font-medium text-stone-500">暂无月报</p>
              <p className="text-stone-400 text-sm text-center px-8">
                每月最后一天中午12点会自动生成月报
              </p>
            </div>
          ) : (
            [...monthlyReports]
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((report) => (
                <div key={report.id} className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 hover:shadow-[0_4px_20px_rgba(251,146,60,0.1)] transition-all duration-300 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-stone-700 text-lg tracking-tight">{new Date(report.startDate).getMonth() + 1}月心情报告</h3>
                    <button 
                      onClick={() => deleteMonthlyReport(report.id)}
                      className="text-stone-300 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {user?.username || '用户'}您好，{new Date(report.startDate).getFullYear()}年{new Date(report.startDate).getMonth() + 1}月快要过去了，您本月的心情平均值为{report.avgScore}，希望您下个月能更加开心一些
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'heartsea' && (
        <HeartSea moods={moods} />
      )}
    </div>
  );
};

// 心海组件
const HeartSea: React.FC<{ moods: any[] }> = ({ moods }) => {
  // 按月分组开心时刻
  const happyMomentsByMonth = React.useMemo(() => {
    const months: { [key: string]: number } = {};
    
    moods.forEach(mood => {
      if (mood.mood === 'happy') {
        const date = new Date(mood.timestamp);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + 1;
      }
    });
    
    return months;
  }, [moods]);

  // 获取当前年份
  const currentYear = new Date().getFullYear();
  
  // 生成12个月的心
  const hearts = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const monthKey = `${currentYear}-${monthIndex.toString().padStart(2, '0')}`;
    const happyCount = happyMomentsByMonth[monthKey] || 0;
    
    // 根据开心时刻数量确定心的亮度等级
    let brightnessLevel = 0;
    if (happyCount >= 5) brightnessLevel = 5;
    else if (happyCount >= 4) brightnessLevel = 4;
    else if (happyCount >= 3) brightnessLevel = 3;
    else if (happyCount >= 2) brightnessLevel = 2;
    else if (happyCount >= 1) brightnessLevel = 1;
    
    return {
      id: i,
      month: monthIndex,
      happyCount,
      brightnessLevel
    };
  });

  // 计算总的点亮心数
  const totalLitHearts = hearts.filter(heart => heart.brightnessLevel > 0).length;
  
  // 计算总开心时刻数
  const totalHappyMoments = hearts.reduce((sum, heart) => sum + heart.happyCount, 0);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 mb-6 border border-blue-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"></div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2 relative z-10">心海</h2>
        <p className="text-stone-600 text-sm relative z-10">
          每个月的开心时刻都会点亮心海中的一颗心，记录你的每一份快乐
        </p>
        <div className="mt-3 flex items-center text-rose-600 relative z-10">
          <Heart size={16} className="fill-current mr-1" />
          <span className="text-sm font-medium">{totalLitHearts}/12 个月被点亮，共 {totalHappyMoments} 个开心时刻</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {hearts.map((heart) => (
          <div 
            key={heart.id} 
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${
              heart.brightnessLevel === 5 ? 'bg-gradient-to-br from-pink-300 to-rose-400 border-2 border-rose-500 shadow-xl animate-glow' :
              heart.brightnessLevel === 4 ? 'bg-gradient-to-br from-pink-200 to-rose-300 border-2 border-rose-400 shadow-lg' :
              heart.brightnessLevel === 3 ? 'bg-gradient-to-br from-pink-100 to-rose-200 border-2 border-rose-300 shadow-md' :
              heart.brightnessLevel === 2 ? 'bg-gradient-to-br from-pink-50 to-rose-100 border border-rose-200 shadow-sm' :
              heart.brightnessLevel === 1 ? 'bg-gradient-to-br from-pink-25 to-rose-50 border border-rose-100' :
              'bg-stone-100 border border-stone-200'
            } ${heart.brightnessLevel > 0 ? 'animate-float' : ''}`}
          >
            {/* 波纹效果 */}
            {heart.brightnessLevel > 0 && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-white opacity-30 rounded-2xl animate-ping"></div>
              </div>
            )}
            
            <div className={`relative z-10 transition-all duration-500 ${
              heart.brightnessLevel > 0 ? 'scale-110' : 'scale-100'
            }`}>
              <Heart 
                size={40} 
                className={`${
                  heart.brightnessLevel === 5 ? 'text-white fill-current' :
                  heart.brightnessLevel === 4 ? 'text-rose-50 fill-current' :
                  heart.brightnessLevel === 3 ? 'text-rose-100 fill-current' :
                  heart.brightnessLevel === 2 ? 'text-rose-200 fill-current' :
                  heart.brightnessLevel === 1 ? 'text-rose-300 fill-current' :
                  'text-stone-300'
                }`} 
              />
            </div>
            <div className="mt-2 text-center relative z-10">
              <div className={`text-sm font-bold ${
                heart.brightnessLevel >= 4 ? 'text-white' :
                heart.brightnessLevel === 3 ? 'text-rose-50' :
                heart.brightnessLevel === 2 ? 'text-rose-100' :
                heart.brightnessLevel === 1 ? 'text-rose-200' :
                'text-stone-400'
              }`}>
                {heart.month}月
              </div>
              <div className={`text-xs ${
                heart.brightnessLevel >= 4 ? 'text-rose-100' :
                heart.brightnessLevel === 3 ? 'text-rose-100' :
                heart.brightnessLevel === 2 ? 'text-rose-200' :
                heart.brightnessLevel === 1 ? 'text-rose-300' :
                'text-stone-400'
              }`}>
                {heart.happyCount}个开心时刻
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl p-5 border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-3">心海说明</h3>
        <ul className="text-sm text-stone-600 space-y-2">
          <li className="flex items-start">
            <div className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 mr-2"></div>
            <span>每个月的开心时刻（选择开心情绪）会点亮对应月份的心</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 mr-2"></div>
            <span>开心时刻越多，心的亮度越高：</span>
          </li>
          <li className="flex items-start pl-4">
            <div className="w-2 h-2 bg-stone-300 rounded-full mt-1.5 mr-2"></div>
            <span>1个开心时刻 - 微亮</span>
          </li>
          <li className="flex items-start pl-4">
            <div className="w-2 h-2 bg-rose-200 rounded-full mt-1.5 mr-2"></div>
            <span>2个开心时刻 - 较亮</span>
          </li>
          <li className="flex items-start pl-4">
            <div className="w-2 h-2 bg-rose-300 rounded-full mt-1.5 mr-2"></div>
            <span>3个开心时刻 - 亮</span>
          </li>
          <li className="flex items-start pl-4">
            <div className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 mr-2"></div>
            <span>4个开心时刻 - 很亮</span>
          </li>
          <li className="flex items-start pl-4">
            <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 mr-2"></div>
            <span>5个及以上开心时刻 - 明亮</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 bg-rose-400 rounded-full mt-1.5 mr-2"></div>
            <span>记录更多开心时刻，点亮整片心海</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to calculate week number
const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};