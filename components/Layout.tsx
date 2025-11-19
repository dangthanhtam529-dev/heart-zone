import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, List, TrendingUp, User } from 'lucide-react';
import { HealingModal } from './HealingModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const navItems = [
    { path: '/', icon: PlusCircle, label: '记录' },
    { path: '/list', icon: List, label: '足迹' },
    { path: '/trend', icon: TrendingUp, label: '趋势' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 font-sans selection:bg-orange-100">
      <main className={`${!isAuthPage ? 'pb-24' : ''} max-w-md mx-auto min-h-screen relative bg-[#fdfbf7] sm:shadow-2xl sm:shadow-stone-200 sm:my-0 sm:border-x border-stone-100`}>
        {children}
      </main>

      {/* Global Modals */}
      {!isAuthPage && <HealingModal />}

      {/* Bottom Navigation - Hide on login/register pages */}
      {!isAuthPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-100 py-3 px-6 z-40 max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'text-orange-500 -translate-y-1' 
                      : 'text-stone-400 hover:text-stone-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};