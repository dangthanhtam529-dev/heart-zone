import React from 'react';
import { useMoodStore } from '../context/MoodContext';
import { MoodCard } from '../components/MoodCard';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';

export const MoodList: React.FC = () => {
  const { moods, deleteMood } = useMoodStore();

  return (
    <div className="p-6 pt-12 min-h-screen">
      <header className="flex justify-between items-end mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">心域足迹</h1>
          <p className="text-stone-500 text-sm mt-1">共记录 {moods.length} 次心情</p>
        </div>
      </header>

      {moods.length === 0 ? (
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
      )}
    </div>
  );
};