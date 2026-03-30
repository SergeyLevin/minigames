import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../shared/store';
import { Card, Badge, Button } from '../shared/components';
import { Wallet, Info, ChevronRight, Sparkles } from 'lucide-react';
import { recommenduyAdapter } from '../integrations/recommenduy';

const GAMES = [
  {
    id: 'cashflow',
    title: 'CashFlow',
    description: 'Развивай финансовое мышление и выходи на скоростную дорожку.',
    image: 'https://picsum.photos/seed/cashflow/400/200',
    reward: 'До 180 💎',
    difficulty: 'Средне',
    duration: '5-10 мин',
    isVsBot: true
  },
  {
    id: 'catan',
    title: 'Catan',
    description: 'Строй поселения, добывай ресурсы и торгуй с соседями.',
    image: 'https://picsum.photos/seed/catan/400/200',
    reward: 'До 250 💎',
    difficulty: 'Сложно',
    duration: '10-15 мин',
    isVsBot: true
  },
  {
    id: 'match3',
    title: 'Три в ряд',
    description: 'Собирай кристаллы в ряд и зарабатывай бонусы.',
    image: 'https://picsum.photos/seed/match3/400/200',
    reward: 'До 60 💎',
    difficulty: 'Легко',
    duration: '2-3 мин',
    isVsBot: false
  }
];

export const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  return (
    <div className="p-4 pb-20 bg-[#F9FAFB] min-h-screen">
      {/* Header / User Profile */}
      <div className="flex items-center justify-between mb-8 bg-white p-5 rounded-[32px] shadow-sm border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user?.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-blue-100 shadow-sm" />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Привет, {user?.displayName.split(' ')[0]}!</p>
            <div className="flex items-center gap-1.5 text-blue-600 font-black text-lg">
              <span>{user?.currentBalances.crystals}</span>
              <span className="text-xs opacity-60">💎</span>
            </div>
          </div>
        </div>
        <button onClick={() => recommenduyAdapter.openCurrencyInfo()} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 active:scale-95 transition-transform">
          <Wallet className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 px-1">
        <h1 className="text-2xl font-black text-slate-900">Каталог игр</h1>
        <Badge className="bg-blue-50 text-blue-600 border-blue-100">Beta</Badge>
      </div>

      {/* How it works */}
      <Card className="mb-8 bg-blue-600 border-none text-white p-6 rounded-[32px] shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/20 p-2.5 rounded-2xl">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg mb-1 leading-tight">Зарабатывай кристаллы</h3>
            <p className="text-xs text-blue-50 leading-relaxed font-medium opacity-90">
              Играй в игры, выполняй цели и получай награды. Кристаллы можно обменять на бонусы в приложении.
            </p>
          </div>
        </div>
      </Card>

      {/* Games List */}
      <div className="space-y-6">
        {GAMES.map((game) => (
          <Card 
            key={game.id} 
            className="p-0 overflow-hidden rounded-[32px] border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer group" 
            onClick={() => navigate(`/game/${game.id}`)}
          >
            <div className="relative h-40 overflow-hidden">
              <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-white/90 backdrop-blur text-slate-900 border-none shadow-sm font-black text-[9px] uppercase tracking-widest">
                  {game.difficulty}
                </Badge>
                {game.isVsBot && (
                  <Badge className="bg-blue-600/90 backdrop-blur text-white border-none shadow-sm font-black text-[9px] uppercase tracking-widest">
                    Vs Bot
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">{game.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 text-blue-500 rotate-90" /> {game.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Награда</p>
                  <p className="text-sm font-black text-blue-600">{game.reward}</p>
                </div>
              </div>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed font-medium line-clamp-2">
                {game.description}
              </p>
              <Button className="w-full py-4 rounded-2xl shadow-lg shadow-blue-50 flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-colors">
                Играть <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-10 p-6 bg-slate-100 rounded-[32px] text-center border border-slate-200/50">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Важная информация</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          В играх начисляются только кристаллы. Обмен в серебряные и золотые монеты происходит в основном приложении «Рекомендуй».
        </p>
      </div>
    </div>
  );
};

