import React, { useMemo } from 'react';
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
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const MoodTrends: React.FC = () => {
  const { moods } = useMoodStore();

  const chartData = useMemo(() => {
    const days = 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      const dayMoods = moods.filter(m => isSameDay(new Date(m.timestamp), date));
      
      if (dayMoods.length > 0) {
        const totalScore = dayMoods.reduce((acc, curr) => acc + MOOD_CONFIGS[curr.mood].score, 0);
        const avgScore = totalScore / dayMoods.length;
        data.push({
          date: format(date, 'MM/dd', { locale: zhCN }),
          score: parseFloat(avgScore.toFixed(1)),
          count: dayMoods.length,
          fullDate: format(date, 'yyyy年MM月dd日', { locale: zhCN })
        });
      } else {
        data.push({
           date: format(date, 'MM/dd', { locale: zhCN }),
           score: null, 
           count: 0,
           fullDate: format(date, 'yyyy年MM月dd日', { locale: zhCN })
        });
      }
    }
    return data;
  }, [moods]);

  // Calculate basic stats
  const averageMood = useMemo(() => {
     if (moods.length === 0) return 0;
     const sum = moods.reduce((acc, m) => acc + MOOD_CONFIGS[m.mood].score, 0);
     return (sum / moods.length).toFixed(1);
  }, [moods]);

  return (
    <div className="p-6 pt-12 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">情绪曲线</h1>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 flex-1">
            <span className="text-xs text-orange-600/70 block font-medium mb-1">近30天记录</span>
            <span className="text-2xl font-bold text-orange-500">{moods.length} <span className="text-xs font-normal text-orange-400">条</span></span>
          </div>
          <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-100 flex-1">
            <span className="text-xs text-stone-500 block font-medium mb-1">平均心情值</span>
            <span className="text-2xl font-bold text-stone-600">{averageMood} <span className="text-xs font-normal text-stone-400">/ 5.0</span></span>
          </div>
        </div>
      </header>

      <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm h-80 mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis 
               dataKey="date" 
               tick={{ fontSize: 10, fill: '#a8a29e' }} 
               axisLine={false}
               tickLine={false}
               interval={4}
            />
            <YAxis 
               domain={[0, 5]} 
               ticks={[1, 2, 3, 4, 5]} 
               tick={{ fontSize: 10, fill: '#a8a29e' }}
               axisLine={false}
               tickLine={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', color: '#444' }}
              labelStyle={{ color: '#78716c', fontSize: '12px', marginBottom: '4px' }}
              cursor={{ stroke: '#fb923c', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <ReferenceLine y={3} stroke="#e7e5e4" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#fb923c" 
              strokeWidth={4}
              dot={{ r: 0, fill: '#fb923c', strokeWidth: 0 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#fb923c' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-lg font-bold text-stone-700 mb-4 ml-1">活跃度</h2>
      <div className="bg-white border border-stone-100 rounded-[2rem] p-5 shadow-sm h-52">
        <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
           </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};