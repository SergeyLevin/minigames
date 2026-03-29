import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Trophy, Dice6, Zap, Cpu, RefreshCw, Layers, Sparkles, Clock, Pickaxe, Home, TrendingUp, Target } from 'lucide-react';

interface InstructionModalProps {
  gameType: 'match3' | 'cashflow' | 'catan';
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ gameType, onClose }) => {
  const getContent = () => {
    switch (gameType) {
      case 'match3':
        return {
          title: 'Как играть',
          subtitle: 'Три в ряд',
          items: [
            {
              icon: <RefreshCw className="w-5 h-5 text-blue-600" />,
              iconBg: 'bg-blue-50',
              label: 'Ход',
              text: 'Меняйте соседние кристаллы местами'
            },
            {
              icon: <Layers className="w-5 h-5 text-emerald-600" />,
              iconBg: 'bg-emerald-50',
              label: 'Сбор',
              text: 'Собирайте 3 и более в ряд'
            },
            {
              icon: <Sparkles className="w-5 h-5 text-amber-600" />,
              iconBg: 'bg-amber-50',
              label: 'Комбо',
              text: 'Комбо дают больше очков'
            },
            {
              icon: <Clock className="w-5 h-5 text-rose-600" />,
              iconBg: 'bg-rose-50',
              label: 'Ограничение',
              text: 'Наберите нужное количество очков за ограниченные ходы'
            }
          ],
          goal: 'Набрать максимум очков'
        };
      case 'cashflow':
        return {
          title: 'Как играть',
          subtitle: 'CashFlow',
          items: [
            {
              icon: <Dice6 className="w-5 h-5 text-blue-600" />,
              iconBg: 'bg-blue-50',
              label: 'Процесс',
              text: 'Бросайте кубик и получайте события'
            },
            {
              icon: <Zap className="w-5 h-5 text-amber-600" />,
              iconBg: 'bg-amber-50',
              label: 'Решения',
              text: 'Принимайте решения: купить, рискнуть или пропустить'
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
              iconBg: 'bg-emerald-50',
              label: 'Доход',
              text: 'Увеличивайте пассивный доход'
            },
            {
              icon: <Cpu className="w-5 h-5 text-rose-600" />,
              iconBg: 'bg-rose-50',
              label: 'Соперник',
              text: 'Обгоните бота'
            }
          ],
          goal: 'Пассивный доход > расходы → свобода'
        };
      case 'catan':
        return {
          title: 'Как играть',
          subtitle: 'Catan',
          items: [
            {
              icon: <Pickaxe className="w-5 h-5 text-amber-600" />,
              iconBg: 'bg-amber-50',
              label: 'Ресурсы',
              text: 'Получайте ресурсы'
            },
            {
              icon: <Home className="w-5 h-5 text-blue-600" />,
              iconBg: 'bg-blue-50',
              label: 'Стройка',
              text: 'Стройте дороги и здания'
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
              iconBg: 'bg-emerald-50',
              label: 'Экономика',
              text: 'Развивайте экономику'
            },
            {
              icon: <Trophy className="w-5 h-5 text-rose-600" />,
              iconBg: 'bg-rose-50',
              label: 'Очки',
              text: 'Набирайте очки быстрее бота'
            }
          ],
          goal: 'Набрать нужное количество очков'
        };
    }
  };

  const content = getContent();

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{content.title}</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{content.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">Цель игры</h3>
              <p className="text-slate-700 font-bold text-sm leading-tight">{content.goal}</p>
            </div>
          </div>

          {content.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-1">{item.label}</h3>
                <p className="text-slate-700 font-bold text-sm leading-tight">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-transform"
          >
            Понятно
          </button>
          <button 
            className="w-full py-4 bg-slate-50 text-slate-400 rounded-[20px] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Подробнее
          </button>
        </div>
      </motion.div>
    </div>
  );
};
