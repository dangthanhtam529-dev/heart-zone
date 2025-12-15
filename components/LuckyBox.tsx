import React, { useState, useEffect } from 'react';
import { Mail, Gift, Sparkles, X, Snowflake } from 'lucide-react';
import { SecureStorage } from '../utils/encryption';

const WINTER_NOTES = [
  "晚来天欲雪，能饮一杯无？——白居易《问刘十九》",
  "墙角数枝梅，凌寒独自开。——王安石《梅》",
  "孤舟蓑笠翁，独钓寒江雪。——柳宗元《江雪》",
  "忽如一夜春风来，千树万树梨花开。——岑参《白雪歌送武判官归京》",
  "柴门闻犬吠，风雪夜归人。——刘长卿《逢雪宿芙蓉山主人》",
  "日暮苍山远，天寒白屋贫。——刘长卿《逢雪宿芙蓉山主人》",
  "燕山雪花大如席，片片吹落轩辕台。——李白《北风行》",
  "寒夜客来茶当酒，竹炉汤沸火初红。——杜磊《寒夜》",
  "终南阴岭秀，积雪浮云端。——祖咏《终南望余雪》",
  "不知近水花先发，疑是经冬雪未销。——张谓《早梅》",
  "夜深知雪重，时闻折竹声。——白居易《夜雪》",
  "人生到处知何似，应似飞鸿踏雪泥。——苏轼《和子由渑池怀旧》"
];

export const LuckyBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [availableNotes, setAvailableNotes] = useState<string[]>(WINTER_NOTES);
  const [drawnNotes, setDrawnNotes] = useState<string[]>([]);

  useEffect(() => {
    // Load previously drawn notes
    const savedDrawnNotes = SecureStorage.getItem('heartspace_drawn_notes');
    if (savedDrawnNotes) {
      const parsedDrawnNotes = JSON.parse(savedDrawnNotes);
      setDrawnNotes(parsedDrawnNotes);
      
      // Calculate available notes (not drawn yet)
      const available = WINTER_NOTES.filter(note => !parsedDrawnNotes.includes(note));
      setAvailableNotes(available);
    }

    // Check if user has already drawn today
    const lastDrawnDate = SecureStorage.getItem('heartspace_lucky_date');
    const today = new Date().toDateString();

    if (lastDrawnDate === today) {
      const savedNote = SecureStorage.getItem('heartspace_lucky_note');
      if (savedNote) {
        setCurrentNote(savedNote);
        setIsOpen(true);
      }
    }
  }, []);

  const handleOpen = () => {
    if (isOpen) return;

    // Check if all notes have been drawn
    if (availableNotes.length === 0) {
      // Reset the pool when all notes have been drawn
      const resetDrawnNotes = [];
      const resetAvailableNotes = [...WINTER_NOTES];
      
      setDrawnNotes(resetDrawnNotes);
      setAvailableNotes(resetAvailableNotes);
      
      // Save the reset state
      SecureStorage.setItem('heartspace_drawn_notes', JSON.stringify(resetDrawnNotes));
    }

    setIsShaking(true);
    
    // Simulate shaking animation time
    setTimeout(() => {
      setIsShaking(false);
      setShowAnimation(true);
      
      // Pick a random note from available notes
      const randomIndex = Math.floor(Math.random() * availableNotes.length);
      const selectedNote = availableNotes[randomIndex];
      
      // Update drawn notes and available notes
      const newDrawnNotes = [...drawnNotes, selectedNote];
      const newAvailableNotes = availableNotes.filter((_, index) => index !== randomIndex);
      
      setCurrentNote(selectedNote);
      setDrawnNotes(newDrawnNotes);
      setAvailableNotes(newAvailableNotes);
      setIsOpen(true);
      
      // Save to secure localStorage
      const today = new Date().toDateString();
      SecureStorage.setItem('heartspace_lucky_date', today);
      SecureStorage.setItem('heartspace_lucky_note', selectedNote);
      SecureStorage.setItem('heartspace_drawn_notes', JSON.stringify(newDrawnNotes));
      
      // Hide opening animation after a bit
      setTimeout(() => {
        setShowAnimation(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header Card - Winter Theme */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-lg shadow-sky-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 opacity-20 rounded-full blur-xl -ml-5 -mb-5"></div>
        <div className="absolute top-4 left-1/4 animate-pulse opacity-50"><Snowflake size={16} /></div>
        <div className="absolute bottom-8 right-1/4 animate-bounce opacity-40 animation-delay-1000"><Snowflake size={20} /></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Gift className="mr-2 text-sky-100" size={24} />
            冬日限定盲盒
          </h2>
          <p className="text-sky-50 text-sm opacity-95">
            在这个寒冷的季节，为你寄来一份冬日的诗意。
            <br/>
            愿这句诗词，能温暖你的凛冬。
          </p>
          {/* Progress indicator */}
          <div className="mt-4 bg-white/20 rounded-full p-2">
            <div className="flex justify-between text-xs text-sky-50 mb-1">
              <span>收集进度</span>
              <span>{drawnNotes.length}/{WINTER_NOTES.length}</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(drawnNotes.length / WINTER_NOTES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        
        {/* Background Elements - Winter Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-white rounded-[40px] -z-10 border border-sky-100/50"></div>
        
        {!isOpen ? (
          // Closed State
          <div 
            className={`cursor-pointer group relative ${isShaking ? 'animate-shake' : 'animate-bounce-slow'}`}
            onClick={handleOpen}
          >
            <div className="w-48 h-48 bg-white rounded-[40px] shadow-[0_10px_40px_rgba(56,189,248,0.2)] flex items-center justify-center border-4 border-sky-100 transition-transform group-hover:scale-105 group-hover:shadow-[0_20px_60px_rgba(56,189,248,0.3)]">
              <Mail size={80} className="text-sky-400 fill-sky-50" strokeWidth={1.5} />
              
              {/* Decoration */}
              <div className="absolute -top-4 -right-4 bg-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                点我开启
              </div>
            </div>
            <p className="text-center mt-8 text-stone-500 font-medium tracking-wide">
              点击抽取今日冬日签
            </p>
            <p className="text-center mt-2 text-stone-400 text-sm">
              剩余 {availableNotes.length} 句诗词待收集
            </p>
          </div>
        ) : (
          // Opened State
          <div className="relative w-full max-w-md px-4 animate-scale-in">
            {/* The Note Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden">
              {/* Decorative Quote Marks */}
              <div className="absolute top-4 left-6 text-6xl text-sky-100 font-serif leading-none">“</div>
              <div className="absolute bottom-4 right-6 text-6xl text-sky-100 font-serif leading-none rotate-180">“</div>
              
              <div className="relative z-10 flex flex-col items-center text-center py-6">
                <div className="mb-6 bg-sky-50 p-4 rounded-full">
                  <Sparkles className="text-sky-400" size={32} />
                </div>
                
                <h3 className="text-lg font-bold text-stone-800 mb-6">今日冬日签</h3>
                
                <p className="text-xl text-stone-600 font-medium leading-relaxed font-serif mb-8 px-4">
                  {currentNote}
                </p>
                
                <div className="text-xs text-stone-400 tracking-widest uppercase">
                  HEART ZONE WINTER
                </div>
              </div>

              {/* Top/Bottom Decoration Lines */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 to-sky-300"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-sky-300 to-blue-300"></div>
            </div>
            
            <p className="text-center mt-8 text-stone-400 text-sm">
              {drawnNotes.length >= WINTER_NOTES.length 
                ? '🎉 恭喜！你已收集完所有冬日签，即将重新开始收集之旅 ~' 
                : '明天再来看看吧 ~'
              }
            </p>
          </div>
        )}

        {/* Animation Particles (Simple CSS implementation or simplified here) */}
        {showAnimation && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-full animate-ping bg-sky-100 rounded-full opacity-20"></div>
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
