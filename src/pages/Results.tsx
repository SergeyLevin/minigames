import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../shared/components';
import { Sparkles, Trophy, RotateCcw, Home, AlertCircle, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../shared/store';
import { recommenduyAdapter } from '../integrations/recommenduy';
import { calculateRewardBreakdown } from '../services/rewards';

export const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addCrystals } = useAppStore();
  
  const state = location.state || {};
  const { gameId, score, duration, metadata } = state;
  
  // Use passed breakdown or recalculate if missing (fallback)
  const breakdown = state.breakdown || calculateRewardBreakdown(gameId || 'match3', {
    startTime: Date.now() - (duration || 0),
    moves: state.moves || 0,
    score: score || 0,
    isVictory: state.isVictory || false,
    qualityBonus: state.qualityBonus || 0
  });

  const isVictory = state.isVictory || breakdown.victoryBonus > 0;

  useEffect(() => {
    if (breakdown.total > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#60A5FA', '#FFFFFF', '#FCD34D']
      });
      
      addCrystals(breakdown.total);
      
      recommenduyAdapter.saveGameSession({
        gameId: gameId || 'match3',
        score: score || 0,
        duration: duration || 0,
        crystalsEarned: breakdown.total,
        metadata
      });
    }
  }, [breakdown.total, gameId, score, duration, addCrystals, metadata]);


  return (
    <div className="p-4 flex flex-col min-h-screen bg-[#F9FAFB] justify-center text-center pb-10">
      <div className="mb-10">
        <div className={`w-28 h-28 ${isVictory ? 'bg-yellow-100' : (gameId === 'findpair' || gameId === 'crash' || gameId === 'brickbreaker' ? 'bg-red-100' : 'bg-blue-100')} rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-50`}>
          <Trophy className={`w-14 h-14 ${isVictory ? 'text-yellow-600' : (gameId === 'findpair' || gameId === 'crash' || gameId === 'brickbreaker' ? 'text-red-600' : 'text-blue-600')}`} />
        </div>
        <h1 className="text-3xl font-black mb-2">
          {isVictory ? (gameId === 'match3' ? 'Блестящая победа!' : 'Победа!') : (gameId === 'crash' ? 'Упс! Crash!' : (gameId === 'brickbreaker' ? 'Игра окончена' : 'Игра завершена'))}
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          {gameId === 'crash' ? (isVictory ? `Коэффициент: ${metadata?.cashedOutAt?.toFixed(2)}x` : `Crash на ${metadata?.crashPoint?.toFixed(2)}x`) : (gameId === 'brickbreaker' ? `Разбито блоков: ${metadata?.bricksDestroyed || 0}` : (gameId === 'match3' && isVictory ? 'Вы мастер кристаллов!' : 'Результаты партии'))}
        </p>
      </div>

      <Card className={`mb-8 p-0 border-blue-100 bg-white overflow-hidden shadow-xl shadow-blue-50/50`}>
        <div className={`${((gameId === 'findpair' || gameId === 'crash' || gameId === 'brickbreaker') && !isVictory) ? 'bg-red-600' : 'bg-blue-600'} p-8 text-white`}>
          <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Итоговая награда</p>
          <div className="flex items-center justify-center gap-2 text-5xl font-black">
            <Sparkles className="w-10 h-10 text-yellow-300" />
            <span>{breakdown.total}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {gameId === 'crash' ? (
            <>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Ваша ставка</span>
                <span className="text-gray-700">{metadata?.bet || 0} 💎</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Коэффициент</span>
                <span className={isVictory ? "text-emerald-600" : "text-red-500"}>
                  {isVictory ? `${metadata?.cashedOutAt?.toFixed(2)}x` : '0.00x'}
                </span>
              </div>
            </>
          ) : gameId === 'brickbreaker' ? (
            <>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Разбито блоков</span>
                <span className="text-gray-700">{metadata?.bricksDestroyed || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Пройдено уровней</span>
                <span className="text-gray-700">{metadata?.levelsCleared || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Награда</span>
                <span className="text-blue-600">+{breakdown.total} 💎</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Базовая награда</span>
                <span className="text-gray-700">+{breakdown.base} 💎</span>
              </div>
              
              {breakdown.victoryBonus > 0 && (
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">Бонус за победу</span>
                  <span className="text-green-600">+{breakdown.victoryBonus} 💎</span>
                </div>
              )}

              {(breakdown.qualityBonus > 0 || gameId === 'findpair') && (
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">Бонус за качество</span>
                  <span className="text-blue-600">+{breakdown.qualityBonus} 💎</span>
                </div>
              )}

              {breakdown.penalty > 0 && (
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">Корректировка</span>
                  <span className="text-red-500">-{breakdown.penalty} 💎</span>
                </div>
              )}
            </>
          )}

          {breakdown.message && (
            <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-700 leading-tight">
                {breakdown.message}
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 flex items-center gap-3 border-t border-gray-100">
          <Info className="w-5 h-5 text-gray-300 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 font-bold text-left leading-tight uppercase tracking-wider">
            Обмен кристаллов в серебряные монеты происходит в приложении «Рекомендуй»
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <Button onClick={() => navigate(`/play/${gameId}`)} className="flex items-center justify-center gap-3 py-5 shadow-lg shadow-blue-100">
          <RotateCcw className="w-6 h-6" />
          Сыграть ещё
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')} className="flex items-center justify-center gap-3 py-5">
          <Home className="w-6 h-6" />
          В каталог
        </Button>
      </div>
    </div>
  );
};
