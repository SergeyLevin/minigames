import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../shared/components';
import { ChevronLeft, ShieldCheck, Zap, Trophy, Bot, Sparkles } from 'lucide-react';

const GAME_DATA: Record<string, any> = {
  'match3': {
    title: 'Три в ряд',
    subtitle: 'Собирай комбинации и зарабатывай кристаллы',
    rules: [
      'Меняй соседние кристаллы местами',
      'Собирай 3 и более в ряд',
      'Набери нужное количество очков за ограниченные ходы'
    ],
    rewards: [
      'За прохождение уровня: кристаллы',
      'Победа даёт дополнительный бонус',
      'Чем выше счёт — тем больше награда'
    ]
  },
  'cashflow': {
    title: 'CashFlow',
    subtitle: 'Управляй активами и денежным потоком',
    rules: [
      'Выбирай профессию и начинай с "Крысиных бегов"',
      'Покупай акции и недвижимость для пассивного дохода',
      'Обыграй бота-соперника по уровню пассивного дохода'
    ],
    rewards: [
      'Базовая награда за участие',
      'Бонус за победу над ботом',
      'Дополнительно за итоговый капитал'
    ]
  },
  'catan': {
    title: 'Catan',
    subtitle: 'Добывай ресурсы и строй города',
    rules: [
      'Бросай кубики и получай ресурсы',
      'Строй поселения и дороги для расширения',
      'Набери 10 победных очков быстрее соперников'
    ],
    rewards: [
      'Награда за развитие поселений',
      'Бонус за победу в партии',
      'Дополнительно за особые достижения'
    ]
  }
};

export const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = GAME_DATA[id || ''];

  if (!game) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Header with Back Button */}
      <div className="p-4 pt-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 font-black uppercase text-[10px] mb-6 tracking-widest hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад к играм
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2 tracking-tight">{game.title}</h1>
          <p className="text-gray-500 font-semibold text-lg leading-tight">
            {game.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {/* How to Play Block */}
          <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
              Как играть
            </h3>
            <ul className="space-y-4">
              {game.rules.map((rule: string, i: number) => (
                <li key={i} className="flex items-start gap-4 text-sm font-bold text-gray-800">
                  <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                    {i + 1}
                  </div>
                  <span className="pt-0.5">{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Rewards Block */}
          <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Награды за игру
            </h3>
            <ul className="space-y-4">
              {game.rewards.map((reward: string, i: number) => (
                <li key={i} className="flex items-start gap-4 text-sm font-bold text-gray-800">
                  <div className="w-6 h-6 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="pt-0.5">{reward}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="mt-auto sticky bottom-0 p-4 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] to-transparent pt-10">
        <Button 
          onClick={() => navigate(`/play/${id}`)} 
          className="w-full py-6 text-lg shadow-2xl shadow-blue-200 rounded-[24px]"
        >
          Начать игру
        </Button>
      </div>
    </div>
  );
};
