import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMoodStore } from '../context/MoodContext';
import { Button } from '../components/Button';
import { User, LogOut, Lock, Edit2, Check, Calendar, Smile, Zap, Download, Trash2 } from 'lucide-react';
import { MOOD_CONFIGS } from '../constants';
import { MoodType } from '../types';

export const Profile: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { moods, exportData, clearAllData } = useMoodStore();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || '');
  
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new: '' });
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' });

  // Stats
  const stats = useMemo(() => {
    const totalDays = new Set(moods.map(m => new Date(m.timestamp).toDateString())).size;
    // 修复开心时刻的计算，只计算开心的情绪
    const happyCount = moods.filter(m => 
      m.mood === MoodType.HAPPY
    ).length;
    return { totalDays, happyCount, total: moods.length };
  }, [moods]);

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile({ username: newName });
      setIsEditing(false);
      setMsg({ text: '昵称修改成功', type: 'success' });
    } catch (e: any) {
      setMsg({ text: e.message || '修改失败', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(pwdForm.old, pwdForm.new);
      setMsg({ text: '密码修改成功', type: 'success' });
      setIsChangingPwd(false);
      setPwdForm({ old: '', new: '' });
    } catch (e: any) {
      setMsg({ text: e.message || '修改失败', type: 'error' });
    }
  };

  const handleClearData = () => {
    if(window.confirm("确定要清空所有心情记录吗？此操作无法撤销！")) {
      clearAllData();
      setMsg({ text: '数据已清空', type: 'success' });
    }
  };

  return (
    <div className="p-6 pt-12 animate-fade-in pb-20">
      <header className="mb-8 flex items-end justify-between">
        <h1 className="text-3xl font-bold text-stone-800">我的</h1>
      </header>

      {/* User Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[4rem] -z-0 opacity-50" />
         
         <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 flex items-center justify-center text-white shadow-inner">
               <User size={40} />
            </div>
            <div className="flex-1">
               {isEditing ? (
                 <div className="flex items-center gap-2">
                    <input 
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-lg font-bold text-stone-800 w-full focus:outline-none focus:border-orange-300"
                      autoFocus
                    />
                    <button onClick={handleUpdateProfile} className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200">
                       <Check size={18} />
                    </button>
                 </div>
               ) : (
                  <div className="flex items-center gap-2">
                     <h2 className="text-2xl font-bold text-stone-800">{user?.username}</h2>
                     <button onClick={() => setIsEditing(true)} className="p-1.5 text-stone-300 hover:text-orange-400 transition-colors">
                        <Edit2 size={16} />
                     </button>
                  </div>
               )}
               <p className="text-stone-400 text-sm mt-1">{user?.email}</p>
            </div>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
               <Calendar size={16} />
            </div>
            <span className="text-2xl font-bold text-stone-700 block">{stats.totalDays}</span>
            <span className="text-xs text-stone-400">记录天数</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-2">
               <Smile size={16} />
            </div>
            <span className="text-2xl font-bold text-stone-700 block">{stats.happyCount}</span>
            <span className="text-xs text-stone-400">开心时刻</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
               <Zap size={16} />
            </div>
            <span className="text-2xl font-bold text-stone-700 block">{stats.total}</span>
            <span className="text-xs text-stone-400">总记录</span>
         </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
         <h3 className="font-bold text-stone-700 ml-1">账号安全</h3>
         
         {/* Change Password Section */}
         <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <button 
               onClick={() => setIsChangingPwd(!isChangingPwd)}
               className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
            >
               <div className="flex items-center gap-3 text-stone-600">
                  <Lock size={20} className="text-stone-400" />
                  <span>修改密码</span>
               </div>
               <span className="text-stone-300 text-2xl leading-none select-none">
                  {isChangingPwd ? '-' : '+'}
               </span>
            </button>
            
            {isChangingPwd && (
               <form onSubmit={handleChangePassword} className="p-4 pt-0 bg-stone-50/50 space-y-3 border-t border-stone-50">
                  <input 
                     type="password" 
                     placeholder="当前密码"
                     value={pwdForm.old}
                     onChange={e => setPwdForm({...pwdForm, old: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-orange-300"
                  />
                  <input 
                     type="password" 
                     placeholder="新密码"
                     value={pwdForm.new}
                     onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-orange-300"
                  />
                  <Button type="submit" variant="secondary" fullWidth className="py-2 text-sm">确认修改</Button>
               </form>
            )}
         </div>

        <h3 className="font-bold text-stone-700 ml-1 pt-4">数据管理</h3>
        
        {/* Data Export */}
        <button 
           onClick={exportData}
           className="w-full bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-3 text-stone-600 hover:bg-stone-50 transition-colors"
        >
           <Download size={20} className="text-stone-400" />
           <span>导出数据 (JSON)</span>
        </button>

        {/* Clear Data */}
        <button 
           onClick={handleClearData}
           className="w-full bg-white p-4 rounded-2xl border border-stone-100 flex items-center gap-3 text-rose-500 hover:bg-rose-50 transition-colors border-b-2 border-b-transparent hover:border-b-rose-100"
        >
           <Trash2 size={20} className="text-rose-400" />
           <span>清空心情记录</span>
        </button>

         {msg.text && (
            <div className={`text-center text-sm py-2 ${msg.type === 'error' ? 'text-rose-500' : 'text-green-500'}`}>
               {msg.text}
            </div>
         )}

         <Button variant="danger" fullWidth onClick={logout} className="mt-8 py-4 shadow-none">
            <LogOut size={18} /> 退出登录
         </Button>
      </div>
    </div>
  );
};