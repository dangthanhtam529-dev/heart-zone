import React from 'react';
import { Trash2 } from 'lucide-react';

interface ReportCardProps {
  title: string;
  content: string;
  onDelete: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, content, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 hover:shadow-[0_4px_20px_rgba(251,146,60,0.1)] transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-stone-700 text-lg tracking-tight">{title}</h3>
        <button 
          onClick={onDelete}
          className="text-stone-300 hover:text-rose-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="space-y-3 mt-3">
        <p className="text-stone-600 text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};