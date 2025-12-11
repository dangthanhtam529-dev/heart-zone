import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Heart, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 找回密码相关状态
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPwd, setResetPwd] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetting, setResetting] = useState(false);

  // 页面刷新时清空密码字段
  useEffect(() => {
    setPassword('');
  }, []);

  // 打开找回密码对话框时填充当前邮箱并清空密码
  const openResetPassword = () => {
    setShowReset(true);
    setResetEmail(email); // 自动填充当前输入的邮箱
    setResetPwd(''); // 确保密码字段为空
    setResetMsg('');
  };

  // 关闭找回密码对话框
  const closeResetPassword = () => {
    setShowReset(false);
    setResetPwd('');
    setResetMsg('');
  };

  // 登录失败后点击找回密码时的处理
  const openResetPasswordFromError = () => {
    setShowReset(true);
    setResetEmail(email); // 自动填充当前输入的邮箱
    setResetPwd(''); // 强制清空密码字段，确保没有任何回显
    setResetMsg('');
    setError(''); // 清除登录错误信息
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    setResetMsg('');
    
    try {
      const result = await resetPassword(resetEmail, resetPwd);
      setResetMsg(result.message);
      
      if (result.success) {
        // 成功重置密码后清理状态并关闭窗口
        setTimeout(() => {
          setShowReset(false);
          setPassword(''); // 清空登录页面密码字段
          setError(''); // 清除任何错误信息
          setResetMsg('');
        }, 1500);
      }
    } catch (error: any) {
      setResetMsg(error.message || '重置失败，请重试');
    } finally {
      setResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full mb-6 shadow-lg shadow-orange-100/50">
            <Heart className="text-orange-500 fill-orange-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">欢迎回到心域</h1>
          <p className="text-stone-500 text-sm">温暖你的每一个情绪瞬间</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-stone-300 group-focus-within:text-orange-400 transition-colors" size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="电子邮箱"
                required
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 shadow-sm"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-stone-300 group-focus-within:text-orange-400 transition-colors" size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                required
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-100 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all placeholder-stone-300 text-stone-700 shadow-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-500 text-sm text-center border border-rose-100">
              <div className="mb-2">{error}</div>
              <button
                type="button"
                className="text-orange-500 underline hover:text-orange-600 transition-colors text-xs"
                onClick={openResetPasswordFromError}
              >
                找回密码
              </button>
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading} className="shadow-xl shadow-orange-200/50 py-4 text-lg">
            {loading ? '登录中...' : '进入心域'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-stone-400 text-sm">
            还没有账号？{' '}
            <Link to="/register" className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
              立即注册
            </Link>
          </p>
          <button
            type="button"
            className="mt-4 text-orange-500 font-bold hover:text-orange-600 transition-colors underline"
            onClick={openResetPassword}
          >
            找回密码
          </button>
        </div>

        {showReset && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl border border-orange-100">
              <h2 className="text-lg font-bold text-stone-700 mb-4">找回密码</h2>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <input
                  type="email"
                  value={resetEmail}
                  placeholder="您的邮箱地址"
                  readOnly
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-600 cursor-not-allowed"
                />
                <div className="text-xs text-stone-500 mt-1">
                  邮箱地址不可修改
                </div>
                <input
                  type="password"
                  value={resetPwd}
                  onChange={e => setResetPwd(e.target.value)}
                  placeholder="新密码"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:border-orange-300"
                />
                {resetMsg && (
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-500 text-sm text-center border border-orange-100">{resetMsg}</div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" fullWidth className="py-3" disabled={resetting}>
                    {resetting ? '重置中...' : '设置新密码'}
                  </Button>
                  <Button type="button" variant="secondary" fullWidth className="py-3" onClick={closeResetPassword}>取消</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

  