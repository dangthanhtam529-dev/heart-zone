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
  
  // 根据使用频率计算字体大小
  const getTagSize = (tag: string) => {
    const count = tagCounts[tag] || 0;
    const counts = Object.values(tagCounts) as number[];
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
    const minSize = 12;
    const maxSize = 24;
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
      <div className="flex flex-wrap gap-2 justify-center">
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
                inline-flex items-center px-3 py-1 rounded-full border-2 transition-all duration-200
                hover:scale-105 hover:shadow-md cursor-pointer
                ${getTagColor(tag)}
                ${isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
                ${isHovered ? 'transform scale-105 shadow-lg' : ''}
              `}
              style={{ fontSize: `${fontSize}px` }}
            >
              <Tag size={Math.max(12, fontSize - 6)} className="mr-1" />
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
      
      {hoveredTag && (
        <div className="mt-4 text-center text-sm text-stone-600">
          <p>标签 "{hoveredTag}" 被使用了 {tagCounts[hoveredTag]} 次</p>
        </div>
      )}
    </div>
  );
};