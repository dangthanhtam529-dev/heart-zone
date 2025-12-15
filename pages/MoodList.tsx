import React, { useState, useMemo } from 'react';
import { useMoodStore } from '../context/MoodContext';
import { useReportStore } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { Ghost, Calendar, Trash2, Heart, Star, Sparkles, Moon, Gift, Hourglass, ChevronLeft, ChevronRight, Truck, HeartPulse } from 'lucide-react';
import { MoodCard } from '../components/MoodCard';
import { LuckyBox } from '../components/LuckyBox';
import { TimeCourier } from '../components/TimeCourier';
import { TagCloud } from '../components/TagCloud';
import { EmergencyKit } from '../components/EmergencyKit';
import { Link } from 'react-router-dom';
import { MoodType } from '../types';
import { MOOD_CONFIGS } from '../constants';

const ITEMS_PER_PAGE = 5;

// Helper Component for Pagination
const PaginationControls: React.FC<{
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-8 animate-fade-in">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-full transition-colors ${
          currentPage === 1 
            ? 'text-stone-300 cursor-not-allowed' 
            : 'text-stone-500 hover:bg-stone-100 hover:text-orange-500'
        }`}
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="text-sm font-medium text-stone-500">
        {currentPage} / {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full transition-colors ${
          currentPage === totalPages 
            ? 'text-stone-300 cursor-not-allowed' 
            : 'text-stone-500 hover:bg-stone-100 hover:text-orange-500'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};


// Helper function to calculate week number in month
const getWeekNumberInMonth = (date: Date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const dayOfMonth = date.getDate();
  
  // Calculate which week of the month this date is in
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

// Helper Component for Report Card
const ReportCard: React.FC<{ 
  report: any, 
  title: string, 
  onDelete: () => void 
}> = ({ report, title, onDelete }) => {
  const { user } = useAuth();
  
  // Calculate dominant mood info if available
  const topMoodConfig = report.topMood ? MOOD_CONFIGS[report.topMood] : null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 hover:shadow-[0_4px_20px_rgba(251,146,60,0.1)] transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-stone-700 text-lg tracking-tight">{title}</h3>
        <button 
          onClick={onDelete}
          className="text-stone-300 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Key Stats Row */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-stone-50 rounded-2xl p-3 text-center">
            <span className="block text-xs text-stone-400 mb-1">平均心情</span>
            <span className={`text-xl font-bold ${
              report.avgScore >= 4 ? 'text-orange-500' : 
              report.avgScore >= 3 ? 'text-stone-600' : 'text-blue-500'
            }`}>{report.avgScore}</span>
          </div>
          
          {report.totalEntries && (
            <div className="flex-1 bg-stone-50 rounded-2xl p-3 text-center">
              <span className="block text-xs text-stone-400 mb-1">记录次数</span>
              <span className="text-xl font-bold text-stone-700">{report.totalEntries}</span>
            </div>
          )}

          {topMoodConfig && (
            <div className="flex-1 bg-stone-50 rounded-2xl p-3 text-center">
              <span className="block text-xs text-stone-400 mb-1">主导心情</span>
              <div className="flex items-center justify-center space-x-1">
                <span className={`text-sm font-bold ${topMoodConfig.color.split(' ')[1]}`}>
                  {topMoodConfig.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
          <p className="text-stone-600 text-sm leading-relaxed">
            {report.content || `${user?.username || '用户'}您好，${report.avgScore >= 4.5 ? '这段时间您的状态棒极了！保持这份快乐的能量，继续闪闪发光吧✨' :
             report.avgScore >= 4.0 ? '这段时间过得很不错，虽然有小插曲，但整体是温暖而积极的🌻' :
             report.avgScore >= 3.0 ? '这段时间心情比较平稳，平平淡淡才是真，在平凡的日子里也要照顾好自己☕' :
             report.avgScore >= 2.0 ? '最近似乎有些疲惫，记得多给自己一些休息时间，不要太勉强自己🌙' :
             '这段时间可能有些艰难，请允许自己难过一会儿，但别忘了，阴霾终会散去，我们都在陪着你🫂'}`}
          </p>
        </div>
      </div>
    </div>
  );
};

// 心海组件
const HeartSea: React.FC<{ moods: any[] }> = ({ moods }) => {
  // 筛选开心时刻
  const happyMoods = useMemo(() => {
    return moods.filter(mood => mood.mood === MoodType.HAPPY);
  }, [moods]);

  // 生成星星位置 (只在 happyMoods 改变时重新计算)
  const stars = useMemo(() => {
    return happyMoods.map((mood, index) => {
      // 使用 index 和 mood.id 作为种子生成伪随机位置
      // 为了让星星分布自然，我们使用随机数，但在同一个 mood 列表下保持稳定
      const seed = mood.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const randomX = (seed * 137) % 90 + 5; // 5-95%
      const randomY = (seed * 263) % 80 + 10; // 10-90%
      const size = 12 + (seed % 12); // 12-24px
      const delay = (seed % 5) * 0.5; // 0-2.5s delay for animation
      const duration = 3 + (seed % 4); // 3-7s duration

      return {
        ...mood,
        x: randomX,
        y: randomY,
        size,
        delay,
        duration
      };
    });
  }, [happyMoods]);

  return (
    <div className="pb-20 animate-fade-in">
      {/* 头部卡片 */}
      <div className="bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl p-6 mb-6 text-white relative overflow-hidden shadow-lg shadow-rose-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200 opacity-20 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Sparkles className="mr-2 text-yellow-100" size={24} />
            心海繁星
          </h2>
          <p className="text-rose-50 text-sm mb-4 opacity-95 font-medium">
            每一个开心的瞬间，都化作心海中的一颗暖星。
            <br/>
            越多的快乐，越璀璨的星空。
          </p>
          <div className="inline-flex items-center bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-white shadow-sm border border-white/20">
            <Star size={14} className="fill-yellow-200 text-yellow-200 mr-1.5" />
            <span>共点亮 {happyMoods.length} 颗星星</span>
          </div>
        </div>
      </div>

      {/* 星空区域 */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#4a1c40] via-[#9f3e58] to-[#ff9a8b] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(159,62,88,0.2)] border border-rose-100/30">
        {/* 背景装饰 - 暖月 */}
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-orange-100 blur-[2px] shadow-[0_0_50px_rgba(255,237,213,0.5)] opacity-90"></div>
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-white to-transparent opacity-40"></div>
        
        {/* 背景装饰 - 云朵/柔光 */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-orange-200/30 via-rose-300/10 to-transparent"></div>
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-rose-400/20 rounded-full blur-[80px]"></div>

        {/* 星星 */}
        {stars.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-100/70">
            <Star size={48} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">记录一个开心时刻，点亮第一颗星</p>
          </div>
        ) : (
          stars.map((star) => (
            <div
              key={star.id}
              className="absolute transition-all duration-1000"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                animation: `float ${star.duration}s ease-in-out infinite alternate`,
                animationDelay: `${star.delay}s`
              }}
            >
              <div className="relative group cursor-pointer">
                {/* 光晕 */}
                <div className="absolute inset-0 bg-orange-200 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity"></div>
                {/* 星星本体 */}
                <Star 
                  size={star.size} 
                  className="text-yellow-100 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transform group-hover:scale-125 transition-transform duration-300"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-5 border border-rose-100/50 shadow-sm">
        <h3 className="font-bold text-rose-800 mb-3 text-sm flex items-center">
          <Heart size={16} className="mr-2 text-rose-400 fill-rose-400" />
          关于心海
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          这里是存放温暖的地方。当你记录下"开心"的心情时，就会在这里升起一颗属于你的星星。愿这片暖色的星空，永远治愈你的心房。
        </p>
      </div>
    </div>
  );
};

export const MoodList: React.FC = () => {
  const { moods, deleteMood } = useMoodStore();
  const { user } = useAuth();
  const { 
    weeklyReports, 
    monthlyReports, 
    deleteWeeklyReport, 
    deleteMonthlyReport 
  } = useReportStore();
  
  const [activeTab, setActiveTab] = useState<'cards' | 'briefing' | 'emergency' | 'heartsea' | 'luckybox' | 'courier' | null>(null);
  const [briefingType, setBriefingType] = useState<'weekly' | 'monthly'>('weekly');
  
  // 切换简报类型时重置分页
  const handleBriefingTypeChange = (type: 'weekly' | 'monthly') => {
    setBriefingType(type);
    if (type === 'weekly') {
      setWeekPage(1);
    } else {
      setMonthPage(1);
    }
  };
  
  // Pagination States
  const [moodPage, setMoodPage] = useState(1);
  const [weekPage, setWeekPage] = useState(1);
  const [monthPage, setMonthPage] = useState(1);

  const handleTabClick = (tab: typeof activeTab) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      // Reset pagination on tab switch
     if (tab === 'briefing') {
        if (briefingType === 'weekly') setWeekPage(1);
        else setMonthPage(1);
      }
    }
  };

  // Pagination Helpers
  const getPaginatedData = (data: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  return (
    <div className="p-6 pt-12 min-h-screen">
      <header className="flex justify-between items-end mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">心域足迹</h1>
          <p className="text-stone-500 text-sm mt-1">
            {activeTab === 'cards' && `共记录 ${moods.length} 次心情`}
            {activeTab === 'briefing' && `共 ${briefingType === 'weekly' ? weeklyReports.length : monthlyReports.length} 份${briefingType === 'weekly' ? '周' : '月'}报`}
            {activeTab === 'heartsea' && `心海 · 繁星`}
            {activeTab === 'luckybox' && `每日幸运`}
            {activeTab === 'courier' && `时光快递`}
          </p>
        </div>
      </header>

      {/* 功能标签 */}
      <div className="space-y-3 mb-6">
        {(!activeTab || activeTab === 'cards') && (
          <button 
            onClick={() => handleTabClick('cards')}
            className={`w-full text-left p-4 rounded-2xl transition-all ${
              activeTab === 'cards' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            心情卡片管理
          </button>
        )}
        
        {activeTab === 'cards' && (
          <div className="animate-fade-in mt-4 mb-8">
            {moods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[30vh] text-stone-400">
                <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
                  <Ghost size={56} strokeWidth={1.5} />
                </div>
                <p className="mb-6 text-lg font-medium text-stone-500">这里还是一片荒原</p>
                <Link to="/" className="bg-white border border-stone-200 px-6 py-2.5 rounded-xl text-stone-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm">
                  去种下第一颗种子
                </Link>
              </div>
            ) : (
              <>
                {/* 标签云 */}
                <div className="bg-white rounded-2xl p-5 mb-6 border border-stone-100">
                  <h3 className="font-bold text-stone-700 mb-4 flex items-center">
                    <Sparkles size={16} className="mr-2 text-orange-400" />
                    心情标签云
                  </h3>
                  <TagCloud 
                    onTagSelect={(tag) => {
                      // 可以添加标签筛选功能
                      console.log('选中标签:', tag);
                    }}
                    showCount={true}
                  />
                </div>
                
                <div className="space-y-4">
                  {getPaginatedData(moods, moodPage).map((mood) => (
                    <MoodCard key={mood.id} entry={mood} onDelete={deleteMood} />
                  ))}
                </div>
                <PaginationControls 
                  currentPage={moodPage} 
                  totalItems={moods.length} 
                  onPageChange={setMoodPage} 
                />
              </>
            )}
          </div>
        )}
        
        {(!activeTab || activeTab === 'briefing') && (
          <button 
            onClick={() => handleTabClick('briefing')}
            className={`w-full text-left p-4 rounded-2xl transition-all ${
              activeTab === 'briefing' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            心情简报
          </button>
        )}

        {activeTab === 'briefing' && (
          <div className="animate-fade-in mt-4 mb-8">
            {/* 周报月报切换按钮 */}
            <div className="flex bg-white rounded-2xl p-1 mb-6 border border-stone-100">
              <button
                onClick={() => handleBriefingTypeChange('weekly')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  briefingType === 'weekly'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-stone-600 hover:text-orange-600'
                }`}
              >
                周报
              </button>
              <button
                onClick={() => handleBriefingTypeChange('monthly')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  briefingType === 'monthly'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-stone-600 hover:text-orange-600'
                }`}
              >
                月报
              </button>
            </div>
            
            {briefingType === 'weekly' ? (
              weeklyReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[30vh] text-stone-400">
                  <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
                    <Calendar size={56} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-medium text-stone-500">暂无周报</p>
                  <p className="text-sm text-stone-400 mt-2">每周一将自动生成上周的心情报告</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {getPaginatedData(
                      [...weeklyReports].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
                      weekPage
                    ).map((report) => (
                      <ReportCard 
                        key={report.id}
                        report={report}
                        title={`第${getWeekNumberInMonth(new Date(report.startDate))}周心情报告`}
                        onDelete={() => deleteWeeklyReport(report.id)}
                      />
                    ))}
                  </div>
                  <PaginationControls 
                    currentPage={weekPage} 
                    totalItems={weeklyReports.length} 
                    onPageChange={setWeekPage} 
                  />
                </>
              )
            ) : (
              monthlyReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[30vh] text-stone-400">
                  <div className="bg-stone-100 p-8 rounded-full mb-6 text-stone-300">
                    <Calendar size={56} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-medium text-stone-500">暂无月报</p>
                  <p className="text-sm text-stone-400 mt-2">每月1日将自动生成上月的心情报告</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {getPaginatedData(
                      [...monthlyReports].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
                      monthPage
                    ).map((report) => (
                      <ReportCard 
                        key={report.id}
                        report={report}
                        title={`${new Date(report.startDate).getMonth() + 1}月心情报告`}
                        onDelete={() => deleteMonthlyReport(report.id)}
                      />
                    ))}
                  </div>
                  <PaginationControls 
                    currentPage={monthPage}
                    totalItems={monthlyReports.length}
                    onPageChange={setMonthPage}
                  />
                </>
              )
            )}
          </div>
        )}
        
        {(!activeTab || activeTab === 'emergency') && (
          <button 
            onClick={() => handleTabClick('emergency')}
            className={`w-full text-left p-4 rounded-2xl transition-all flex items-center ${
              activeTab === 'emergency' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <HeartPulse size={18} className="mr-2 opacity-80" />
            情绪急救箱
          </button>
        )}

        {activeTab === 'emergency' && (
          <div className="animate-fade-in mt-4 mb-8">
            <EmergencyKit />
          </div>
        )}
        
        {(!activeTab || activeTab === 'heartsea') && (
          <button 
            onClick={() => handleTabClick('heartsea')}
            className={`w-full text-left p-4 rounded-2xl transition-all ${
              activeTab === 'heartsea' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            心海
          </button>
        )}

        {activeTab === 'heartsea' && (
          <div className="animate-fade-in mt-4 mb-8">
            <HeartSea moods={moods} />
          </div>
        )}

        {(!activeTab || activeTab === 'luckybox') && (
          <button 
            onClick={() => handleTabClick('luckybox')}
            className={`w-full text-left p-4 rounded-2xl transition-all flex items-center ${
              activeTab === 'luckybox' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Gift size={18} className="mr-2 opacity-80" />
            每日盲盒
          </button>
        )}

        {activeTab === 'luckybox' && (
          <div className="animate-fade-in mt-4 mb-8">
            <LuckyBox />
          </div>
        )}

        {(!activeTab || activeTab === 'courier') && (
          <button 
            onClick={() => handleTabClick('courier')}
            className={`w-full text-left p-4 rounded-2xl transition-all flex items-center ${
              activeTab === 'courier' 
                ? 'bg-orange-100 border border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border border-stone-100 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Truck size={18} className="mr-2 opacity-80" />
            时光快递
          </button>
        )}

        {activeTab === 'courier' && (
          <div className="animate-fade-in mt-4 mb-8">
            <TimeCourier />
          </div>
        )}
      </div>

    </div>
  );
};

