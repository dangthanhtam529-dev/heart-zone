import React, { useState, useEffect } from 'react';
import { EmergencyKitItem } from '../types';
import { Heart, Wind, Brain, Sparkles, Plus, X, Play, Clock } from 'lucide-react';
import { Button } from './Button';
import { SecureStorage } from '../utils/encryption';

interface EmergencyKitProps {
  className?: string;
}

const DEFAULT_KIT_ITEMS: EmergencyKitItem[] = [
  {
    id: 'breathing-1',
    title: '4-7-8呼吸法',
    description: '吸气4秒，屏息7秒，呼气8秒，重复3-4次',
    category: 'breathing',
    duration: 2
  },
  {
    id: 'breathing-2',
    title: '盒式呼吸',
    description: '吸气4秒，屏息4秒，呼气4秒，屏息4秒',
    category: 'breathing',
    duration: 3
  },
  {
    id: 'movement-1',
    title: '肩颈放松',
    description: '缓慢转动颈部，耸肩放松，缓解身体紧张',
    category: 'movement',
    duration: 5
  },
  {
    id: 'movement-2',
    title: '手指操',
    description: '握拳张开，手指交叉，激活手部神经',
    category: 'movement',
    duration: 3
  },
  {
    id: 'mindfulness-1',
    title: '五感观察',
    description: '观察5样看到的物品，4种听到的声音，3种触摸的感觉',
    category: 'mindfulness',
    duration: 4
  },
  {
    id: 'mindfulness-2',
    title: '感恩清单',
    description: '写下3件今天值得感恩的小事',
    category: 'mindfulness',
    duration: 5
  },
  {
    id: 'self-care-1',
    title: '温水洗脸',
    description: '用温水轻柔洗脸，感受水流带来的平静',
    category: 'self-care',
    duration: 3
  },
  {
    id: 'self-care-2',
    title: '香薰舒缓',
    description: '深呼吸，想象喜欢的香味充满整个空间',
    category: 'self-care',
    duration: 4
  }
];

const CATEGORY_CONFIGS = {
  breathing: {
    icon: Wind,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: '呼吸调节'
  },
  movement: {
    icon: Heart,
    color: 'bg-green-100 text-green-700 border-green-200',
    label: '身体放松'
  },
  mindfulness: {
    icon: Brain,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    label: '正念练习'
  },
  'self-care': {
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    label: '自我关怀'
  },
  custom: {
    icon: Plus,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: '自定义'
  }
};

export const EmergencyKit: React.FC<EmergencyKitProps> = ({ className = '' }) => {
  const [items, setItems] = useState<EmergencyKitItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', duration: 3 });
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    // 从本地存储加载急救箱项目
    const savedItems = SecureStorage.getItem('emergencyKitItems');
    if (savedItems) {
      setItems([...DEFAULT_KIT_ITEMS, ...JSON.parse(savedItems)]);
    } else {
      setItems(DEFAULT_KIT_ITEMS);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeItem && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && activeItem) {
      setActiveItem(null);
    }
    return () => clearInterval(interval);
  }, [timer, activeItem]);

  const saveCustomItems = (updatedItems: EmergencyKitItem[]) => {
    const customItems = updatedItems.filter(item => item.isCustom);
    SecureStorage.setItem('emergencyKitItems', JSON.stringify(customItems));
  };

  const addCustomItem = () => {
    if (newItem.title.trim() && newItem.description.trim()) {
      const customItem: EmergencyKitItem = {
        id: `custom-${Date.now()}`,
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        category: 'custom',
        duration: newItem.duration,
        isCustom: true
      };
      
      const updatedItems = [...items, customItem];
      setItems(updatedItems);
      saveCustomItems(updatedItems);
      setNewItem({ title: '', description: '', duration: 3 });
      setShowAddForm(false);
    }
  };

  const deleteCustomItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveCustomItems(updatedItems);
  };

  const startPractice = (item: EmergencyKitItem) => {
    setActiveItem(item.id);
    setTimer((item.duration || 3) * 60); // 转换为秒
  };

  const stopPractice = () => {
    setActiveItem(null);
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-stone-100 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-stone-700 text-lg flex items-center">
          <Heart size={20} className="mr-2 text-rose-400" />
          情绪急救箱
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-stone-800 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          全部
        </button>
        {Object.entries(CATEGORY_CONFIGS).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Icon size={14} />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* 添加自定义项目表单 */}
      {showAddForm && (
        <div className="bg-stone-50 rounded-2xl p-4 mb-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="练习名称"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full p-3 bg-white rounded-xl border border-stone-200 text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
            />
            <textarea
              placeholder="练习描述"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full p-3 bg-white rounded-xl border border-stone-200 text-sm resize-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
              rows={2}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-stone-600">时长（分钟）:</label>
              <input
                type="number"
                min="1"
                max="30"
                value={newItem.duration}
                onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) || 3 })}
                className="w-20 p-2 bg-white rounded-lg border border-stone-200 text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addCustomItem}
                className="flex-1 py-2 text-sm"
                disabled={!newItem.title.trim() || !newItem.description.trim()}
              >
                添加
              </Button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-stone-200 text-stone-600 rounded-xl hover:bg-stone-300 transition-colors text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 练习项目列表 */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const config = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS];
          const Icon = config.icon;
          const isActive = activeItem === item.id;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-orange-50 border-orange-200 shadow-sm' 
                  : 'bg-stone-50 border-stone-100 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${config.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-700 text-sm mb-1">{item.title}</h4>
                    <p className="text-stone-600 text-xs leading-relaxed mb-2">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.duration || 3}分钟
                      </span>
                      <span className="text-stone-400">•</span>
                      <span>{config.label}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <>
                      <div className="text-orange-600 font-mono text-sm font-bold">
                        {formatTime(timer)}
                      </div>
                      <button
                        onClick={stopPractice}
                        className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startPractice(item)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Play size={14} />
                      </button>
                      {item.isCustom && (
                        <button
                          onClick={() => deleteCustomItem(item.id)}
                          className="p-2 bg-stone-200 text-stone-500 rounded-lg hover:bg-stone-300 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-stone-500">
          <Heart size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">暂无相关练习</p>
        </div>
      )}
    </div>
  );
};