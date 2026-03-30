import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Sparkles, Pause, Trophy, Dice6, Zap, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateRewardBreakdown, RewardBreakdown } from '../services/rewards';

// Импортируем игровые движки
import { Match3Game } from '../games/match3/Match3Game';
import { CashFlowGame } from '../games/cashflow/CashFlowGame';
import { CatanGame } from '../games/catan/CatanGame';
import { InstructionModal } from '../shared/InstructionModal';

export const GameSession = () => {
  const { id } = useParams<{ id: 'match3' | 'cashflow' | 'catan' }>();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleGameEnd = (finalScore: number, finalMoves: number, isVictory: boolean = false, quality: number = 0) => {
    const breakdown: RewardBreakdown = calculateRewardBreakdown(id || '', {
      startTime,
      score: finalScore,
      moves: finalMoves,
      isVictory,
      qualityBonus: quality
    });
    
    navigate('/results', { 
      state: { 
        gameId: id, 
        score: finalScore, 
        crystals: breakdown.total,
        breakdown,
        duration: Date.now() - startTime
      } 
    });
  };

  const renderGame = () => {
    switch (id) {
      case 'match3':
        return <Match3Game onUpdate={setScore} onMove={() => setMoves(m => m + 1)} onEnd={handleGameEnd} />;
      case 'cashflow':
        return <CashFlowGame onUpdate={setScore} onMove={() => setMoves(m => m + 1)} onEnd={handleGameEnd} />;
      case 'catan':
        return <CatanGame onUpdate={setScore} onMove={() => setMoves(m => m + 1)} onEnd={handleGameEnd} />;
      default:
        return <div>Игра не найдена</div>;
    }
  };


  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Game Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-sm uppercase tracking-tight leading-none">
              {id === 'match3' ? 'Три в ряд' : id === 'cashflow' ? 'CashFlow' : 'Catan'}
            </h2>
            <div className="flex items-center gap-1 text-blue-600 font-bold text-xs mt-1">
              <Sparkles className="w-3 h-3" />
              <span>{Math.floor(score / 10)} кристаллов</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInstructions(true)}
            className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={() => setIsPaused(true)} className="p-2 bg-gray-100 rounded-full active:scale-95 transition-transform">
            <Pause className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Game Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#F3F4F6]">
        {renderGame()}
        
        {isPaused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm"
            >
              <h2 className="text-2xl font-black mb-2">Пауза</h2>
              <p className="text-gray-500 mb-6">Прогресс сохранен. Готовы продолжить?</p>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full py-4 bg-blue-600 text-white rounded-[18px] font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                >
                  Продолжить
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-gray-100 text-gray-600 rounded-[18px] font-bold active:scale-95 transition-transform"
                >
                  Выйти в меню
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {showInstructions && id && (
            <InstructionModal 
              gameType={id} 
              onClose={() => setShowInstructions(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
