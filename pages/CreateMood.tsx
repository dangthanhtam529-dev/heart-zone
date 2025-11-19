
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoodStore } from '../context/MoodContext';
import { MoodType } from '../types';
import { MOOD_CONFIGS, getMoodIcon } from '../constants';
import { Button } from '../components/Button';
import { MapPin, Activity, Camera, X } from 'lucide-react';

export const CreateMood: React.FC = () => {
  const navigate = useNavigate();
  const { addMood } = useMoodStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsSubmitting(true);
    
    try {
      await addMood({
        location: location || '未知地点',
        activity: activity || '发呆',
        mood: selectedMood,
        photoUrl,
        note
      });
      navigate('/list');
    } catch (e) {
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
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
        </section>

        {/* Photo Upload */}
        <section>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          {!photoUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-stone-200 rounded-2xl p-8 flex flex-col items-center justify-center text-stone-400 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300 group"
            >
              <div className="bg-stone-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                <Camera size={24} />
              </div>
              <span className="text-sm font-medium">添加照片 (可选)</span>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <img src={photoUrl} alt="Preview" className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <button
                   type="button"
                   onClick={() => setPhotoUrl(undefined)}
                   className="bg-white text-rose-500 px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-rose-50 hover:scale-105 transition shadow-lg font-medium"
                 >
                   <X size={16} /> 移除照片
                 </button>
              </div>
            </div>
          )}
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
