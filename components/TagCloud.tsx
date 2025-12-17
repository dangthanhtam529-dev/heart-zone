import React, { useState } from 'react';
import { useMoodStore } from '../context/MoodContext';
import { Tag, X } from 'lucide-react';

interface TagCloudProps {
  onTagSelect?: (tag: string) => void;
  selectedTag?: string | null;
  showCount?: boolean;
}

export const TagCloud: React.FC<TagCloudProps> = ({ 
  onTagSelect, 
  selectedTag, 
  showCount = true 
}) => {
  const { getAllTags, getTagCounts } = useMoodStore();
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  
  const allTags = getAllTags();
  const tagCounts = getTagCounts();
  
  if (allTags.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <Tag size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">还没有标签，开始为心情记录添加标签吧～</p>
      </div>
    );
  }
  
  // 根据使用频率计算字体大小 - 调整范围以适应更紧凑的布局
  const getTagSize = (tag: string) => {
    const count = tagCounts[tag] || 0;
    const counts = Object.values(tagCounts) as number[];
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
    const minSize = 10;  // 减小最小字体大小
    const maxSize = 18;  // 减小最大字体大小
    return minSize + (count / maxCount) * (maxSize - minSize);
  };
  
  // 根据使用频率计算颜色强度
  const getTagColor = (tag: string) => {
    const count = tagCounts[tag] || 0;
    const counts = Object.values(tagCounts) as number[];
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
    const intensity = count / maxCount;
    
    if (intensity > 0.7) return 'bg-orange-500 text-white border-orange-500';
    if (intensity > 0.4) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-stone-100 text-stone-600 border-stone-200';
  };
  
  return (
    <div className="p-4">
      {/* Fixed height container with scrollable content */}
      <div className="max-h-64 overflow-y-auto rounded-lg custom-scrollbar">
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            const isHovered = hoveredTag === tag;
            const fontSize = getTagSize(tag);
            
            return (
              <button
                key={tag}
                onClick={() => onTagSelect?.(tag)}
                onMouseEnter={() => setHoveredTag(tag)}
                onMouseLeave={() => setHoveredTag(null)}
                className={`
                  inline-flex items-center px-2 py-1 rounded-full border transition-all duration-200
                  hover:scale-105 hover:shadow cursor-pointer whitespace-nowrap
                  ${getTagColor(tag)}
                  ${isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
                  ${isHovered ? 'transform scale-105 shadow-md' : ''}
                `}
                style={{ fontSize: `${fontSize}px` }}
              >
                <Tag size={Math.max(10, fontSize - 4)} className="mr-1" />
                {tag}
                {showCount && (
                  <span className="ml-1 text-xs opacity-75">
                    {tagCounts[tag]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {hoveredTag && (
        <div className="mt-3 text-center text-sm text-stone-600">
          <p>标签 "{hoveredTag}" 被使用了 {tagCounts[hoveredTag]} 次</p>
        </div>
      )}
      
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
  );
};