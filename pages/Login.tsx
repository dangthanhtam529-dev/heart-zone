import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Heart, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
              {error}
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
        </div>
      </div>
    </div>
  );
};