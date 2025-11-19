import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { MOOD_CONFIGS, getMoodIcon } from '../constants';
import { MapPin, Calendar, Trash2, Maximize2, X } from 'lucide-react';

interface MoodCardProps {
  entry: MoodEntry;
  onDelete: (id: string) => void;
}

export const MoodCard: React.FC<MoodCardProps> = ({ entry, onDelete }) => {
  const config = MOOD_CONFIGS[entry.mood];
  const Icon = getMoodIcon(entry.mood);
  const date = new Date(entry.timestamp);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 hover:shadow-[0_4px_20px_rgba(251,146,60,0.1)] transition-all duration-300 relative overflow-hidden group">
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${config.color} bg-opacity-30`}>
              <Icon size={24} className={config.color.split(' ')[1]} />
            </div>
            <div>
              <h3 className="font-bold text-stone-700 text-lg tracking-tight">{config.label}</h3>
              <p className="text-xs text-stone-400 flex items-center gap-1 font-medium">
                <Calendar size={12} />
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => onDelete(entry.id)}
            className="text-stone-300 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-stone-50 text-stone-600 border border-stone-100 text-xs px-2.5 py-1 rounded-lg font-medium">
              {entry.activity}
            </span>
            <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-lg">
              <MapPin size={12} /> {entry.location}
            </span>
          </div>
          
          {entry.note && (
            <p className="text-stone-600 text-sm leading-relaxed pl-3 border-l-[3px] border-orange-100 py-1">
              {entry.note}
            </p>
          )}
        </div>

        {/* Photo Thumbnail */}
        {entry.photoUrl && (
          <div className="mt-4 relative group/image">
            <div className="overflow-hidden rounded-2xl">
                <img 
                src={entry.photoUrl} 
                alt="Mood memory" 
                className="w-full h-32 object-cover transform group-hover/image:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setIsExpanded(true)}
                />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all rounded-2xl flex items-center justify-center pointer-events-none">
               <Maximize2 className="text-white opacity-0 group-hover/image:opacity-100 drop-shadow-md transform scale-75 group-hover/image:scale-100 transition-all" />
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isExpanded && entry.photoUrl && (
        <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-md transition-all"
            onClick={() => setIsExpanded(false)}
          >
            <X size={24} />
          </button>
          <img 
            src={entry.photoUrl} 
            alt="Full memory" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl animate-fade-in"
          />
        </div>
      )}
    </>
  );
};