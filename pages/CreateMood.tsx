
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoodStore } from '../context/MoodContext';
import { MoodType } from '../types';
import { MOOD_CONFIGS, getMoodIcon } from '../constants';
import { Button } from '../components/Button';
import { MapPin, Activity, Tag, Plus, X } from 'lucide-react';

export const CreateMood: React.FC = () => {
  const navigate = useNavigate();
  const { addMood } = useMoodStore();

  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsSubmitting(true);
    
    try {
      await addMood({
        location: location || '未知地点',
        activity: activity || '发呆',
        mood: selectedMood,
        note,
        tags: tags.length > 0 ? tags : undefined
      });
      navigate('/list');
    } catch (e) {
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="p-6 pt-12 animate-fade-in max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">此刻</h1>
        <p className="text-stone-500">记录当下的情绪与足迹...</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <section>
          <label className="block text-sm font-bold text-stone-700 mb-4 ml-1">现在感觉如何？</label>
          <div className="grid grid-cols-3 gap-4">
            {Object.values(MoodType).map((mood) => {
              const config = MOOD_CONFIGS[mood];
              const Icon = getMoodIcon(mood);
              const isSelected = selectedMood === mood;

              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border
                    ${isSelected 
                      ? `${config.color.replace('text-', 'bg-').replace('bg-', 'ring-')} border-transparent shadow-md transform scale-105 ring-2 ring-offset-2 ring-offset-[#fdfbf7]` 
                      : 'bg-white border-stone-100 text-stone-300 hover:bg-stone-50 hover:text-stone-500 hover:border-stone-200'
                    }
                  `}
                >
                  <div className={`mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : 'scale-100'}`}>
                     <Icon size={32} strokeWidth={isSelected ? 2 : 1.5} />
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'opacity-100' : 'opacity-80'}`}>{config.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="text-stone-300 group-focus-within:text-orange-400 transition-colors" size={20} />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="在哪儿？"
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Activity className="text-stone-300 group-focus-within:text-orange-400 transition-colors" size={20} />
            </div>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="在做什么？"
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 shadow-sm"
            />
          </div>

           <div className="relative">
             <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下此刻的想法..."
              rows={3}
              className="w-full p-4 bg-white rounded-2xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 text-sm resize-none shadow-sm"
            />
           </div>

           {/* 标签输入 */}
           <div className="relative">
             <div className="flex items-center gap-2 mb-2">
               <Tag size={16} className="text-stone-400" />
               <span className="text-sm text-stone-600">添加标签（最多5个）</span>
             </div>
             
             {/* 已添加的标签 */}
             {tags.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-3">
                 {tags.map((tag) => (
                   <span
                     key={tag}
                     className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                   >
                     {tag}
                     <button
                       type="button"
                       onClick={() => removeTag(tag)}
                       className="ml-2 hover:text-orange-900"
                     >
                       <X size={14} />
                     </button>
                   </span>
                 ))}
               </div>
             )}
             
             {/* 标签输入框 */}
             {tags.length < 5 && (
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={newTag}
                   onChange={(e) => setNewTag(e.target.value)}
                   onKeyPress={handleTagInputKeyPress}
                   placeholder="输入标签..."
                   className="flex-1 p-3 bg-white rounded-xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 text-sm shadow-sm"
                 />
                 <button
                   type="button"
                   onClick={addTag}
                   disabled={!newTag.trim()}
                   className="px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   <Plus size={18} />
                 </button>
               </div>
             )}
           </div>
        </section>

        <div className="pt-4">
            <Button 
            type="submit" 
            fullWidth 
            disabled={!selectedMood || isSubmitting}
            className="py-4 text-lg shadow-orange-200 shadow-xl"
            >
            {isSubmitting ? '保存中...' : '生成心情卡片'}
            </Button>
        </div>
      </form>
    </div>
  );
};
