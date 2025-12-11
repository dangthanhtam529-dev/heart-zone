import React, { useState, useEffect } from 'react';
import { Package, Truck, Inbox, Clock, CheckCircle, X, Box, Stamp, ArrowRight, Gift } from 'lucide-react';
import { SecureStorage } from '../utils/encryption';

// 类型定义
type PackageSize = 'small' | 'medium' | 'large';

interface TimePackage {
  id: string;
  content: string;
  createdAt: number;
  deliveryDurationDays: number;
  size: PackageSize;
  receivedAt?: number;
}

const STORAGE_KEY = 'heartspace_courier_packages';

// 包裹规格配置
const PACKAGE_CONFIGS = {
  small: {
    label: '小型包裹',
    limit: 15,
    days: 7,
    icon: <Box size={24} className="text-amber-600" />,
    color: 'bg-amber-100 border-amber-200 text-amber-800',
    desc: '轻量寄语，一周送达'
  },
  medium: {
    label: '中型包裹',
    limit: 30,
    days: 15,
    icon: <Box size={32} className="text-orange-600" />,
    color: 'bg-orange-100 border-orange-200 text-orange-800',
    desc: '温暖短笺，半月送达'
  },
  large: {
    label: '大型包裹',
    limit: 50,
    days: 30,
    icon: <Box size={40} className="text-stone-600" />,
    color: 'bg-stone-200 border-stone-300 text-stone-800',
    desc: '深情厚谊，一月送达'
  }
};

export const TimeCourier: React.FC = () => {
  const [packages, setPackages] = useState<TimePackage[]>([]);
  const [mode, setMode] = useState<'station' | 'send' | 'receive'>('station');
  
  // 发货状态
  const [selectedSize, setSelectedSize] = useState<PackageSize>('small');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 收货状态
  const [viewingPackage, setViewingPackage] = useState<TimePackage | null>(null);

  // 初始化加载与自动清理
  useEffect(() => {
    const saved = SecureStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedPackages: TimePackage[] = saved;
      const now = Date.now();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      // 过滤掉签收超过3天的包裹
      const validPackages = parsedPackages.filter(pkg => {
        if (!pkg.receivedAt) return true;
        return (now - pkg.receivedAt) < threeDaysMs;
      });

      if (validPackages.length !== parsedPackages.length) {
        SecureStorage.setItem(STORAGE_KEY, validPackages);
      }
      setPackages(validPackages);
    }
  }, []);

  // 保存包裹
  const handleSend = () => {
    if (!content.trim()) return;
    
    setIsSending(true);
    
    setTimeout(() => {
      const newPackage: TimePackage = {
        id: Date.now().toString(),
        content: content.trim(),
        createdAt: Date.now(),
        deliveryDurationDays: PACKAGE_CONFIGS[selectedSize].days,
        size: selectedSize
      };

      const updatedPackages = [...packages, newPackage];
      setPackages(updatedPackages);
      SecureStorage.setItem(STORAGE_KEY, updatedPackages);
      
      // 重置状态
      setContent('');
      setIsSending(false);
      setMode('station');
    }, 1500); // 模拟发货动画时间
  };

  // 签收包裹
  const handleReceive = (pkg: TimePackage) => {
    const updatedPackages = packages.map(p => {
      if (p.id === pkg.id) {
        return { ...p, receivedAt: Date.now() };
      }
      return p;
    });
    setPackages(updatedPackages);
    SecureStorage.setItem(STORAGE_KEY, updatedPackages);
    setViewingPackage({ ...pkg, receivedAt: Date.now() });
  };

  // 计算包裹状态
  const getPackageStatus = (pkg: TimePackage) => {
    if (pkg.receivedAt) return 'received';
    const arrivalTime = pkg.createdAt + (pkg.deliveryDurationDays * 24 * 60 * 60 * 1000);
    return Date.now() >= arrivalTime ? 'arrived' : 'shipping';
  };

  // 获取剩余天数
  const getDaysRemaining = (pkg: TimePackage) => {
    const arrivalTime = pkg.createdAt + (pkg.deliveryDurationDays * 24 * 60 * 60 * 1000);
    const diff = arrivalTime - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  // 获取销毁倒计时
  const getDeleteDaysRemaining = (pkg: TimePackage) => {
    if (!pkg.receivedAt) return 0;
    const deleteTime = pkg.receivedAt + (3 * 24 * 60 * 60 * 1000);
    const diff = deleteTime - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const arrivedCount = packages.filter(p => getPackageStatus(p) === 'arrived').length;
  const shippingCount = packages.filter(p => getPackageStatus(p) === 'shipping').length;

  return (
    <div className="animate-fade-in pb-20">
      {/* 头部：时光快递站 */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-lg shadow-amber-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-900 opacity-10 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        {/* 装饰纹理 - 邮戳风格 */}
        <div className="absolute top-4 right-12 border-2 border-white/20 w-16 h-16 rounded-full flex items-center justify-center rotate-12 opacity-30">
          <span className="text-[10px] font-mono tracking-widest text-center">TIME<br/>POST</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Truck className="mr-2 text-amber-100" size={24} />
            时光快递
          </h2>
          <p className="text-amber-50 text-sm opacity-95 font-medium">
            给未来的自己寄一份温暖，
            <br/>
            在正向反馈的循环中，收获成长的喜悦。
          </p>
        </div>
      </div>

      {/* 主界面 */}
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm min-h-[450px] relative overflow-hidden">
        
        {/* 模式一：快递站大厅 */}
        {mode === 'station' && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 py-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
              {/* 我要发货 */}
              <button
                onClick={() => setMode('send')}
                className="group relative bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-3xl p-6 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Package className="text-amber-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mt-4 mb-2">我要发货</h3>
                <p className="text-sm text-amber-700/70">寄给未来的包裹</p>
                <div className="mt-6 flex items-center text-amber-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  去填写运单 <ArrowRight size={16} className="ml-1" />
                </div>
              </button>

              {/* 我要收货 */}
              <button
                onClick={() => setMode('receive')}
                className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 rounded-3xl p-6 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Inbox className="text-emerald-500" size={24} />
                </div>
                {arrivedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                    {arrivedCount}
                  </span>
                )}
                <h3 className="text-xl font-bold text-emerald-900 mt-4 mb-2">我要收货</h3>
                <p className="text-sm text-emerald-700/70">
                  {arrivedCount > 0 ? `${arrivedCount} 个包裹待签收` : `${shippingCount} 个包裹运输中`}
                </p>
                <div className="mt-6 flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  前往收货区 <ArrowRight size={16} className="ml-1" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 模式二：发货台 */}
        {mode === 'send' && (
          <div className="animate-fade-in max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-700 flex items-center">
                <button onClick={() => setMode('station')} className="mr-3 p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <ArrowRight className="rotate-180 text-stone-400" size={20} />
                </button>
                填写运单
              </h3>
            </div>

            {/* 选择规格 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(Object.keys(PACKAGE_CONFIGS) as PackageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`relative p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
                    selectedSize === size 
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 ring-offset-1' 
                      : 'border-stone-100 hover:border-amber-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="mb-2">{PACKAGE_CONFIGS[size].icon}</div>
                  <span className={`text-sm font-bold block ${selectedSize === size ? 'text-amber-900' : 'text-stone-600'}`}>
                    {PACKAGE_CONFIGS[size].label}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1">{PACKAGE_CONFIGS[size].days}天送达</span>
                </button>
              ))}
            </div>

            {/* 提示信息 */}
            <div className="bg-stone-50 p-3 rounded-xl mb-4 text-xs text-stone-500 flex items-start">
              <Clock size={14} className="mr-2 mt-0.5 shrink-0" />
              <p>{PACKAGE_CONFIGS[selectedSize].desc}。字数限制 {PACKAGE_CONFIGS[selectedSize].limit} 字。</p>
            </div>

            {/* 输入区域 */}
            <div className="relative mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={PACKAGE_CONFIGS[selectedSize].limit}
                placeholder="写给未来的自己..."
                className="w-full h-32 p-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 resize-none text-stone-700 placeholder-stone-300"
              />
              <div className="absolute bottom-3 right-3 text-xs text-stone-400 font-mono">
                {content.length}/{PACKAGE_CONFIGS[selectedSize].limit}
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleSend}
              disabled={!content.trim() || isSending}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
                !content.trim() || isSending
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-200 hover:-translate-y-0.5'
              }`}
            >
              {isSending ? (
                <>
                  <Truck className="animate-bounce mr-2" size={20} />
                  正在发货...
                </>
              ) : (
                <>
                  <Stamp className="mr-2" size={20} />
                  确认发货
                </>
              )}
            </button>
          </div>
        )}

        {/* 模式三：收货区 */}
        {mode === 'receive' && (
          <div className="animate-fade-in h-full flex flex-col">
             <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-lg font-bold text-stone-700 flex items-center">
                <button onClick={() => {
                  setMode('station');
                  setViewingPackage(null);
                }} className="mr-3 p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <ArrowRight className="rotate-180 text-stone-400" size={20} />
                </button>
                收货区
              </h3>
            </div>

            {/* 包裹详情弹窗/覆盖层 */}
            {viewingPackage && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-scale-in">
                <div className="w-full max-w-md bg-white border border-stone-100 rounded-3xl shadow-xl p-8 relative">
                  <button 
                    onClick={() => setViewingPackage(null)}
                    className="absolute top-4 right-4 p-2 text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                      <Box size={48} />
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h4 className="text-xl font-bold text-stone-800 mb-2">来自过去的鼓励</h4>
                    <p className="text-xs text-stone-400 font-mono">
                      寄件时间：{new Date(viewingPackage.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-2xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                      <Stamp size={100} />
                    </div>
                    <p className="text-stone-700 font-medium leading-relaxed relative z-10">
                      “{viewingPackage.content}”
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-orange-400 mb-2 flex items-center justify-center">
                      <Clock size={12} className="mr-1" />
                      本包裹将在 {getDeleteDaysRemaining(viewingPackage)} 天后自动销毁
                    </p>
                    <p className="text-xs text-stone-300">
                      让过去留在过去，带上力量继续前行
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 包裹列表 */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                  <div className="bg-stone-100 p-6 rounded-full mb-4">
                    <Inbox size={48} />
                  </div>
                  <p>暂时没有包裹哦</p>
                  <button onClick={() => setMode('send')} className="mt-4 text-amber-500 font-bold text-sm hover:underline">
                    去寄一个？
                  </button>
                </div>
              ) : (
                [...packages]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(pkg => {
                  const status = getPackageStatus(pkg);
                  const config = PACKAGE_CONFIGS[pkg.size];

                  return (
                    <div key={pkg.id} className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          status === 'arrived' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                          status === 'received' ? 'bg-stone-100 text-stone-400' :
                          'bg-blue-50 text-blue-400'
                        }`}>
                          {status === 'arrived' ? <Gift size={24} /> :
                           status === 'received' ? <CheckCircle size={24} /> :
                           <Truck size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-stone-700">{config.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              status === 'arrived' ? 'bg-amber-100 text-amber-700' :
                              status === 'received' ? 'bg-stone-100 text-stone-500' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {status === 'arrived' ? '待签收' :
                               status === 'received' ? '已签收' :
                               '运输中'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            {status === 'shipping' 
                              ? `预计 ${getDaysRemaining(pkg)} 天后送达` 
                              : status === 'arrived'
                              ? '包裹已送达，请签收'
                              : `${getDeleteDaysRemaining(pkg)} 天后自动销毁`}
                          </p>
                        </div>
                      </div>

                      <div>
                        {status === 'arrived' && (
                          <button
                            onClick={() => handleReceive(pkg)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 hover:shadow-amber-200 transition-all"
                          >
                            签收
                          </button>
                        )}
                        {status === 'received' && (
                          <button
                            onClick={() => setViewingPackage(pkg)}
                            className="text-stone-400 hover:text-stone-600 px-3 py-2 text-sm font-medium"
                          >
                            查看
                          </button>
                        )}
                        {status === 'shipping' && (
                          <div className="text-stone-300 px-3">
                            <Clock size={20} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
