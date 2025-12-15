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
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium border border-orange-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};