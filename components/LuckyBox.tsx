import React, { useState, useEffect } from 'react';
import { Mail, Gift, Sparkles, X } from 'lucide-react';

const LUCKY_NOTES = [
  "生活原本沉闷，但跑起来就有风。",
  "保持热爱，奔赴山海。",
  "你通过了昨天的考验，今天的奖励是开心一整天。",
  "别慌，月亮也正在大海某处迷茫。",
  "允许一切发生，生活自有安排。",
  "慢慢理解世界，慢慢更新自己。",
  "不仅要看远方的风景，也要看脚下的路。",
  "好运正在路上，请保持期待。",
  "今天的你，比昨天更棒了一点点。",
  "记得给自己的生活加点糖。",
  "万物皆有裂痕，那是光照进来的地方。",
  "在这个星球上，你很重要，请借我你的光。",
  "愿你眼里有光，心中有爱，目光所及皆是美好。",
  "与其互为人间，不如自成宇宙。",
  "每一个不曾起舞的日子，都是对生命的辜负。",
  "温柔半两，从容一生。",
  "所有的失去，都会以另一种方式归来。",
  "你逆光而来，配得上这世间所有的好。",
  "热爱可抵岁月漫长。",
  "心中有暖，又何惧人生荒凉。"
];

export const LuckyBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Check if user has already drawn today
    const lastDrawnDate = localStorage.getItem('heartspace_lucky_date');
    const today = new Date().toDateString();

    if (lastDrawnDate === today) {
      const savedNote = localStorage.getItem('heartspace_lucky_note');
      if (savedNote) {
        setCurrentNote(savedNote);
        setIsOpen(true);
      }
    }
  }, []);

  const handleOpen = () => {
    if (isOpen) return;

    setIsShaking(true);
    
    // Simulate shaking animation time
    setTimeout(() => {
      setIsShaking(false);
      setShowAnimation(true);
      
      // Pick a random note
      const randomNote = LUCKY_NOTES[Math.floor(Math.random() * LUCKY_NOTES.length)];
      setCurrentNote(randomNote);
      setIsOpen(true);
      
      // Save to localStorage
      const today = new Date().toDateString();
      localStorage.setItem('heartspace_lucky_date', today);
      localStorage.setItem('heartspace_lucky_note', randomNote);
      
      // Hide opening animation after a bit
      setTimeout(() => {
        setShowAnimation(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-lg shadow-rose-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300 opacity-20 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Gift className="mr-2 text-yellow-100" size={24} />
            每日盲盒
          </h2>
          <p className="text-rose-50 text-sm opacity-90">
            在这个小小的信箱里，藏着给你的每日惊喜。
            <br/>
            愿这张小纸条，能温暖你的今天。
          </p>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white rounded-[40px] -z-10"></div>
        
        {!isOpen ? (
          // Closed State
          <div 
            className={`cursor-pointer group relative ${isShaking ? 'animate-shake' : 'animate-bounce-slow'}`}
            onClick={handleOpen}
          >
            <div className="w-48 h-48 bg-white rounded-[40px] shadow-[0_10px_40px_rgba(251,146,60,0.2)] flex items-center justify-center border-4 border-orange-100 transition-transform group-hover:scale-105 group-hover:shadow-[0_20px_60px_rgba(251,146,60,0.3)]">
              <Mail size={80} className="text-orange-400 fill-orange-50" strokeWidth={1.5} />
              
              {/* Decoration */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                点我开启
              </div>
            </div>
            <p className="text-center mt-8 text-stone-500 font-medium tracking-wide">
              点击抽取今日幸运签
            </p>
          </div>
        ) : (
          // Opened State
          <div className="relative w-full max-w-md px-4 animate-scale-in">
            {/* The Note Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden">
              {/* Decorative Quote Marks */}
              <div className="absolute top-4 left-6 text-6xl text-orange-100 font-serif leading-none">“</div>
              <div className="absolute bottom-4 right-6 text-6xl text-orange-100 font-serif leading-none rotate-180">“</div>
              
              <div className="relative z-10 flex flex-col items-center text-center py-6">
                <div className="mb-6 bg-orange-50 p-4 rounded-full">
                  <Sparkles className="text-orange-400" size={32} />
                </div>
                
                <h3 className="text-lg font-bold text-stone-800 mb-6">今日幸运签</h3>
                
                <p className="text-xl text-stone-600 font-medium leading-relaxed font-serif mb-8 px-4">
                  {currentNote}
                </p>
                
                <div className="text-xs text-stone-400 tracking-widest uppercase">
                  HEART ZONE DAILY
                </div>
              </div>

              {/* Top/Bottom Decoration Lines */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-300 to-orange-300"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 to-rose-300"></div>
            </div>
            
            <p className="text-center mt-8 text-stone-400 text-sm">
              明天再来看看吧 ~
            </p>
          </div>
        )}

        {/* Animation Particles (Simple CSS implementation or simplified here) */}
        {showAnimation && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-full animate-ping bg-orange-100 rounded-full opacity-20"></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
