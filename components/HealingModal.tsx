import React from 'react';
import { useMoodStore } from '../context/MoodContext';
import { Button } from './Button';
import { Sparkles, X, MapPin } from 'lucide-react';
import { MOOD_CONFIGS, getMoodIcon } from '../constants';

export const HealingModal: React.FC = () => {
  const { healingSuggestion, clearHealingSuggestion } = useMoodStore();

  if (!healingSuggestion) return null;

  const config = MOOD_CONFIGS[healingSuggestion.mood];
  const Icon = getMoodIcon(healingSuggestion.mood);
  const date = new Date(healingSuggestion.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in"
        onClick={clearHealingSuggestion}
      />

      {/* Modal Content */}
      <div className="bg-white w-full sm:w-96 rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl transform transition-transform animate-slide-up pointer-events-auto relative overflow-hidden">
        {/* Decorative Background Gradients */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-60" />
        
        <button 
          onClick={clearHealingSuggestion}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 z-20"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-100 to-rose-100 text-orange-500 rounded-full mb-5 shadow-sm">
            <Sparkles size={26} />
          </div>
          
          <h3 className="text-2xl font-bold text-stone-800 mb-3">温暖的回忆</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6 px-4">
            感受到你现在心情有些低落。<br/>
            还记得 <span className="font-medium text-orange-500">{date.toLocaleDateString()}</span> 的那份美好吗？
          </p>

          {/* Memory Card Mini */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-left border border-stone-100 shadow-sm mb-8 w-full">
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${config.color} bg-opacity-20`}>
                      <Icon size={20} className={config.color.split(' ')[1]} />
                   </div>
                   <div>
                       <span className="font-bold text-stone-700 block text-sm">{config.label}</span>
                       <span className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {healingSuggestion.location}
                       </span>
                   </div>
                </div>
             </div>

            <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-600 border border-stone-100/50">
               正在：{healingSuggestion.activity}
            </div>
          </div>

          <Button fullWidth onClick={clearHealingSuggestion} className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white border-0 shadow-lg shadow-orange-200/50 py-3.5 text-lg rounded-2xl">
            收到治愈
          </Button>
        </div>
      </div>
    </div>
  );
};