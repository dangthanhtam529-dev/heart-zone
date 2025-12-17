import React, { useMemo, useState } from 'react';
import { useMoodStore } from '../context/MoodContext';
import { MOOD_CONFIGS } from '../constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const MoodTrends: React.FC = () => {
  const { moods } = useMoodStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '30days'>('30days');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  // 自定义Tooltip组件
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // 如果是对比模式，显示所有数据点的信息
      if (showComparison && payload.length > 1) {
        return (
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-stone-100">
            <p className="text-xs text-stone-500 mb-3">{label}</p>
            
            // 显示当前周期数据
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <p className="text-sm font-medium text-stone-800">{timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '近30天'}分数：{payload[0].value || '无记录'}</p>
              </div>
              {payload[0].value && (
                <div className="ml-5">
                  {payload[0].payload.notes && payload[0].payload.notes.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-stone-100">
                      <p className="text-xs font-medium text-stone-600 mb-1">心情笔记：</p>
                      {payload[0].payload.notes.map((note: string, index: number) => (
                        <p key={index} className="text-xs text-stone-500">• {note}</p>
                      ))}
                    </div>
                  )}
                  {payload[0].payload.activities && payload[0].payload.activities.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-stone-100">
                      <p className="text-xs font-medium text-stone-600 mb-1">活动：</p>
                      {payload[0].payload.activities.map((activity: string, index: number) => (
                        <p key={index} className="text-xs text-stone-500">• {activity}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            // 显示对比周期数据
            <div>
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-sm font-medium text-stone-800">{timeRange === 'week' ? '上周' : timeRange === 'month' ? '上月' : '上月'}分数：{payload[1].value || '无记录'}</p>
              </div>
              {payload[1].value && comparisonChartData.length > 0 && comparisonChartData[payload[1].dataKey === 'score' ? payload[1].index : payload[0].index] && (
                <div className="ml-5">
                  {comparisonChartData[payload[1].dataKey === 'score' ? payload[1].index : payload[0].index].notes.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-stone-100">
                      <p className="text-xs font-medium text-stone-600 mb-1">心情笔记：</p>
                      {comparisonChartData[payload[1].dataKey === 'score' ? payload[1].index : payload[0].index].notes.map((note: string, index: number) => (
                        <p key={index} className="text-xs text-stone-500">• {note}</p>
                      ))}
                    </div>
                  )}
                  {comparisonChartData[payload[1].dataKey === 'score' ? payload[1].index : payload[0].index].activities.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-stone-100">
                      <p className="text-xs font-medium text-stone-600 mb-1">活动：</p>
                      {comparisonChartData[payload[1].dataKey === 'score' ? payload[1].index : payload[0].index].activities.map((activity: string, index: number) => (
                        <p key={index} className="text-xs text-stone-500">• {activity}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // 非对比模式，显示单个数据点信息
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-stone-100">
          <p className="text-xs text-stone-500 mb-2">{payload[0].payload.fullDate}</p>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <p className="text-sm font-medium text-stone-800">心情分数：{payload[0].value}</p>
          </div>
          {payload[0].payload.notes && payload[0].payload.notes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-stone-100">
              <p className="text-xs font-medium text-stone-600 mb-1">心情笔记：</p>
              {payload[0].payload.notes.map((note: string, index: number) => (
                <p key={index} className="text-xs text-stone-500">• {note}</p>
              ))}
            </div>
          )}
          {payload[0].payload.activities && payload[0].payload.activities.length > 0 && (
            <div className="mt-2 pt-2 border-t border-stone-100">
              <p className="text-xs font-medium text-stone-600 mb-1">活动：</p>
              {payload[0].payload.activities.map((activity: string, index: number) => (
                <p key={index} className="text-xs text-stone-500">• {activity}</p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 生成日期范围
  const generateDateRange = (date: Date, range: string, isComparison: boolean = false) => {
    let dateRange: Date[] = [];
    const now = new Date();
    const isCurrentPeriod = !isComparison && date === now;
    
    switch (range) {
      case 'week':
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = isCurrentPeriod ? now : endOfWeek(date, { weekStartsOn: 1 });
        dateRange = eachDayOfInterval({ start: weekStart, end: weekEnd });
        break;
      case 'month':
        const monthStart = startOfMonth(date);
        // 如果是当前周期，只显示到今天；如果是对比周期，显示到与当前日期对应的同期日期
        const targetEndDate = isCurrentPeriod 
          ? now 
          : new Date(date.getFullYear(), date.getMonth(), Math.min(now.getDate(), endOfMonth(date).getDate()));
        dateRange = eachDayOfInterval({ start: monthStart, end: targetEndDate });
        break;
      default: // 30 days
        for (let i = 29; i >= 0; i--) {
          const targetDate = subDays(date, i);
          if (isCurrentPeriod && targetDate > now) continue;
          dateRange.push(targetDate);
        }
    }
    return dateRange;
  };

  // 生成图表数据
  const generateChartData = (date: Date, range: string, isComparison: boolean = false) => {
    // 使用isComparison参数生成正确的日期范围
    const dateRange = generateDateRange(date, range, isComparison);
    const data = [];
    
    for (const d of dateRange) {
      const dayMoods = moods.filter(m => isSameDay(new Date(m.timestamp), d));
      
      if (dayMoods.length > 0) {
        const totalScore = dayMoods.reduce((acc, curr) => acc + MOOD_CONFIGS[curr.mood].score, 0);
        const avgScore = totalScore / dayMoods.length;
        // 收集当日所有笔记和活动
        const notes = dayMoods
          .filter(m => m.note)
          .map(m => m.note!)
          .slice(0, 3); // 最多显示3条笔记
        const activities = dayMoods
          .map(m => m.activity)
          .filter((activity, index, self) => self.indexOf(activity) === index) // 去重
          .slice(0, 3); // 最多显示3个活动
        data.push({
          date: format(d, 'MM/dd', { locale: zhCN }),
          score: parseFloat(avgScore.toFixed(1)),
          count: dayMoods.length,
          fullDate: format(d, 'yyyy年MM月dd日', { locale: zhCN }),
          notes: notes,
          activities: activities,
          originalDate: d,
          moodDetails: dayMoods
        });
      } else {
        data.push({
           date: format(d, 'MM/dd', { locale: zhCN }),
           score: null, 
           count: 0,
           fullDate: format(d, 'yyyy年MM月dd日', { locale: zhCN }),
           notes: [],
           activities: [],
           originalDate: d,
           moodDetails: []
        });
      }
    }
    return data;
  };

  // 当前周期数据
  const chartData = useMemo(() => {
    return generateChartData(new Date(), timeRange, false);
  }, [moods, timeRange]);

  // 对比周期数据
  const comparisonChartData = useMemo(() => {
    if (!showComparison) return [];
    
    const compareDate = timeRange === 'week' 
      ? subWeeks(new Date(), 1) 
      : timeRange === 'month' 
        ? subMonths(new Date(), 1) 
        : subDays(new Date(), 30);
    
    return generateChartData(compareDate, timeRange, true);
  }, [moods, timeRange, showComparison]);

  // 合并当前和对比数据
  const mergedChartData = useMemo(() => {
    if (!showComparison) return chartData;
    
    // 确保两个数据集长度相同，只对比到当前日期
    const minLength = Math.min(chartData.length, comparisonChartData.length);
    return chartData.slice(0, minLength).map((item, index) => {
      return {
        ...item,
        compareScore: comparisonChartData[index]?.score || null
      };
    });
  }, [chartData, comparisonChartData, showComparison]);

  // 识别关键节点
  const keyNodes = useMemo(() => {
    return chartData.filter(item => {
      if (item.score === null) return false;
      // 识别峰值和谷值
      const prevScore = chartData[chartData.indexOf(item) - 1]?.score || item.score;
      const nextScore = chartData[chartData.indexOf(item) + 1]?.score || item.score;
      
      return (
        (item.score > prevScore && item.score > nextScore) || // 峰值
        (item.score < prevScore && item.score < nextScore) || // 谷值
        Math.abs(item.score - 3) > 1.5 // 远离平均值
      );
    });
  }, [chartData]);

  // Calculate filtered moods based on time range
  const filteredMoods = useMemo(() => {
    return moods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      const now = new Date();
      
      switch (timeRange) {
        case 'week':
          const weekStart = startOfWeek(now, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
          return moodDate >= weekStart && moodDate <= weekEnd;
        case 'month':
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);
          return moodDate >= monthStart && moodDate <= monthEnd;
        default: // 30 days
          const thirtyDaysAgo = subDays(now, 29); // 29 because we include today
          return moodDate >= thirtyDaysAgo && moodDate <= now;
      }
    });
  }, [moods, timeRange]);

  // Calculate average mood based on filtered moods
  const averageMood = useMemo(() => {
    if (filteredMoods.length === 0) return 0;
    
    const sum = filteredMoods.reduce((acc, m) => acc + MOOD_CONFIGS[m.mood].score, 0);
    return (sum / filteredMoods.length).toFixed(1);
  }, [filteredMoods]);

  return (
    <div className="p-6 pt-12 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">情绪曲线</h1>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 flex-1 min-w-[150px]">
            <span className="text-xs text-orange-600/70 block font-medium mb-1">
              {timeRange === 'week' ? '本周记录' : timeRange === 'month' ? '本月记录' : '近30天记录'}
            </span>
            <span className="text-2xl font-bold text-orange-400">{filteredMoods.length} <span className="text-xs font-normal text-orange-400">条</span></span>
          </div>
          <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-100 flex-1 min-w-[150px]">
            <span className="text-xs text-stone-500 block font-medium mb-1">平均心情值</span>
            <span className="text-2xl font-bold text-stone-600">{averageMood} <span className="text-xs font-normal text-stone-400">/ 5.0</span></span>
          </div>
          {/* 近30天范围不显示对比按钮 */}
          {timeRange !== '30days' && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showComparison ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {showComparison ? '隐藏对比' : `${timeRange === 'week' ? '上周' : '上月'}对比`}
            </button>
          )}
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-stone-100 p-1">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timeRange === 'week' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}
          >
            本周
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timeRange === 'month' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}
          >
            本月
          </button>
          <button 
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${timeRange === '30days' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}
          >
            近30天
          </button>
        </div>
      </div>

      {/* Mood Score Line Chart with Comparison */}
      <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm h-96 mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCompareScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis 
               dataKey="date" 
               tick={{ fontSize: 10, fill: '#a8a29e' }} 
               axisLine={false}
               tickLine={false}
               interval={timeRange === 'week' ? 0 : 4}
            />
            <YAxis 
               domain={[0, 5]} 
               ticks={[1, 2, 3, 4, 5]} 
               tick={{ fontSize: 10, fill: '#a8a29e' }}
               axisLine={false}
               tickLine={false}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#fb923c', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <ReferenceLine y={3} stroke="#e7e5e4" strokeDasharray="3 3" />
            
            {/* 当前周期曲线 */}
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#fb923c" 
              strokeWidth={4}
              dot={{ 
                r: 6, 
                fill: '#fb923c', 
                stroke: '#ffffff',
                strokeWidth: 2,
                onClick: (data: any) => setSelectedDay(data.payload)
              }}
              activeDot={{ 
                r: 8, 
                strokeWidth: 2, 
                stroke: '#ffffff',
                fill: '#fb923c'
              }}
              connectNulls
            />
            
            {/* 对比周期曲线 */}
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="compareScore" 
                stroke="#60a5fa" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ 
                  r: 5, 
                  fill: '#60a5fa', 
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{ 
                  r: 7, 
                  strokeWidth: 2, 
                  stroke: '#ffffff',
                  fill: '#60a5fa'
                }}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Nodes */}
      {keyNodes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-stone-700 mb-4 ml-1">关键节点</h2>
          <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {keyNodes.map((node, index) => (
                <div 
                  key={index}
                  className="bg-stone-50 rounded-xl p-4 border border-stone-100 hover:bg-orange-50 hover:border-orange-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedDay(node)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-stone-800">{node.date}</p>
                    <div className={`w-3 h-3 rounded-full ${node.score > 3.5 ? 'bg-green-500' : node.score < 2.5 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <p className="text-xs text-stone-600 mb-1">
                    {node.score > 3.5 ? '心情高峰' : node.score < 2.5 ? '心情低谷' : '情绪波动'}
                  </p>
                  <p className="text-xs font-medium text-stone-700">心情分数: {node.score}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-stone-700 mb-4 ml-1">{selectedDay.fullDate} 详情</h2>
          <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm">
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-orange-500 mr-3"></div>
                <p className="text-sm font-medium text-stone-800">平均心情分数: {selectedDay.score}</p>
              </div>
              
              {selectedDay.activities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-2">活动记录:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.activities.map((activity: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-stone-100 rounded-full text-xs text-stone-600">{activity}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDay.notes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-700 mb-2">心情笔记:</p>
                  <div className="space-y-2">
                    {selectedDay.notes.map((note: string, index: number) => (
                      <div key={index} className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600">{note}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">心情记录:</p>
                <div className="space-y-3">
                  {selectedDay.moodDetails.map((mood: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-stone-50 p-3 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${MOOD_CONFIGS[mood.mood].color}`}></div>
                        <p className="text-sm text-stone-700">{MOOD_CONFIGS[mood.mood].label}</p>
                      </div>
                      <p className="text-xs text-stone-500">
                        {format(new Date(mood.timestamp), 'HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f5f5f5;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
              }
            `}</style>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-stone-700 mb-4 ml-1">活跃度</h2>
      <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm h-52">
        <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} interval={timeRange === 'week' ? 0 : 4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
           </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};