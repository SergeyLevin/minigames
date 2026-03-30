import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../shared/store';
import { Sparkles, TrendingUp, AlertCircle, Coins, Clock } from 'lucide-react';

interface CrashGameProps {
  onUpdate: (score: number) => void;
  onMove: () => void;
  onEnd: (score: number, moves: number, isVictory: boolean, qualityBonus: number, metadata?: any) => void;
}

const BET_OPTIONS = [10, 25, 50, 100];

export const CrashGame: React.FC<CrashGameProps> = ({ onUpdate, onMove, onEnd }) => {
  const { user, addCrystals, crashAttempts, useCrashAttempt } = useAppStore();
  
  const [bet, setBet] = useState(10);
  const [status, setStatus] = useState<'idle' | 'playing' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  
  const requestRef = useRef<number | null>(null);
  const multiplierRef = useRef<number>(1.0);

  const generateCrashPoint = () => {
    const rand = Math.random();
    if (rand < 0.6) return 1.01 + Math.random() * 0.99; // 1.01 - 2.00 (60%)
    if (rand < 0.85) return 2.0 + Math.random() * 3.0; // 2.00 - 5.00 (25%)
    if (rand < 0.95) return 5.0 + Math.random() * 5.0; // 5.00 - 10.00 (10%)
    return 10.0 + Math.random() * 5.0; // 10.00 - 15.00 (5%)
  };

  // Animation Loop
  useEffect(() => {
    if (status !== 'playing') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastTime: number | null = null;

    const animate = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Growth logic: exponential-like growth
      const growthRate = 0.1 + (multiplierRef.current - 1) * 0.15;
      multiplierRef.current += growthRate * deltaTime;

      if (multiplierRef.current >= crashPoint) {
        setMultiplier(crashPoint);
        setStatus('crashed');
        return;
      }

      setMultiplier(multiplierRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, crashPoint]);

  const startRound = () => {
    if (!user || user.currentBalances.crystals < bet) return;
    if (crashAttempts.used >= 3) return;

    onMove();
    useCrashAttempt();
    addCrystals(-bet);
    
    const point = generateCrashPoint();
    setCrashPoint(point);
    setMultiplier(1.0);
    multiplierRef.current = 1.0;
    setStatus('playing');
    setCashedOutAt(null);
    setStartTime(Date.now());
  };

  const cashOut = () => {
    if (status !== 'playing') return;
    
    const finalMult = multiplier;
    setCashedOutAt(finalMult);
    setStatus('cashed_out');
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (status === 'crashed' || status === 'cashed_out') {
      const isWin = status === 'cashed_out';
      const finalScore = isWin ? Math.floor(bet * (cashedOutAt || 0)) : 0;
      
      setTimeout(() => {
        onEnd(
          finalScore, 
          1, 
          isWin, 
          isWin ? (cashedOutAt || 0) : 0,
          {
            bet,
            crashPoint,
            cashedOutAt,
            isWin,
            attemptsUsedToday: crashAttempts.used,
            attemptsRemainingToday: 3 - crashAttempts.used
          }
        );
      }, 2000);
    }
  }, [status, bet, crashPoint, cashedOutAt, onEnd, crashAttempts.used]);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const attemptsLeft = 3 - crashAttempts.used;
  const canStart = user && user.currentBalances.crystals >= bet && attemptsLeft > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-700 ${
          status === 'playing' ? 'bg-blue-600/20' : 
          status === 'crashed' ? 'bg-red-600/30' : 
          status === 'cashed_out' ? 'bg-emerald-600/30' : 'bg-slate-800/10'
        }`} />
      </div>

      {/* Header Info */}
      <div className="w-full flex justify-between items-start z-10">
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
            <Clock className="w-3 h-3" />
            Попытки
          </div>
          <div className="text-xl font-black">
            {attemptsLeft} <span className="text-slate-500 text-sm">/ 3</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-right">
          <div className="flex items-center justify-end gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Баланс
            <Coins className="w-3 h-3" />
          </div>
          <div className="text-xl font-black text-yellow-400">
            {user?.currentBalances.crystals || 0}
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 relative">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <TrendingUp className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-black mb-2">Готовы к риску?</h2>
              <p className="text-slate-400 text-sm font-medium max-w-[200px] mx-auto">
                Выбери ставку и успей забрать до взрыва!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center relative"
            >
              {/* Multiplier Display */}
              <motion.div 
                className={`text-8xl font-black tracking-tighter mb-2 ${
                  status === 'crashed' ? 'text-red-500' : 
                  status === 'cashed_out' ? 'text-emerald-500' : 'text-white'
                }`}
                animate={status === 'playing' ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {multiplier.toFixed(2)}x
              </motion.div>

              {/* Status Message */}
              <div className="h-8">
                {status === 'crashed' && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-red-500 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    CRASHED!
                  </motion.div>
                )}
                {status === 'cashed_out' && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-emerald-500 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    ВЫИГРЫШ: +{Math.floor(bet * (cashedOutAt || 0))} 💎
                  </motion.div>
                )}
              </div>

              {/* Visual Graph/Line */}
              <div className="mt-8 w-72 h-48 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 200">
                  {/* Grid lines */}
                  <g opacity="0.1">
                    {[0, 50, 100, 150, 200, 250, 300].map(x => (
                      <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="200" stroke="white" strokeWidth="1" />
                    ))}
                    {[0, 40, 80, 120, 160, 200].map(y => (
                      <line key={`y-${y}`} x1="0" y1={y} x2="300" y2={y} stroke="white" strokeWidth="1" />
                    ))}
                  </g>
                  
                  {/* Dynamic Curve */}
                  <path
                    d={`M 0 200 C ${Math.min(100, (multiplier - 1) * 10)} 200 ${Math.min(200, (multiplier - 1) * 20)} ${Math.max(150, 200 - (multiplier - 1) * 10)} ${Math.min(300, (multiplier - 1) * 30)} ${Math.max(0, 200 - Math.pow(multiplier - 1, 1.4) * 15)}`}
                    fill="none"
                    stroke={status === 'crashed' ? '#ef4444' : status === 'cashed_out' ? '#10b981' : '#3b82f6'}
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
                  
                  {/* Glow under the curve */}
                  <path
                    d={`M 0 200 C ${Math.min(100, (multiplier - 1) * 10)} 200 ${Math.min(200, (multiplier - 1) * 20)} ${Math.max(150, 200 - (multiplier - 1) * 10)} ${Math.min(300, (multiplier - 1) * 30)} ${Math.max(0, 200 - Math.pow(multiplier - 1, 1.4) * 15)} L ${Math.min(300, (multiplier - 1) * 30)} 200 L 0 200 Z`}
                    fill={status === 'crashed' ? 'rgba(239, 68, 68, 0.05)' : status === 'cashed_out' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)'}
                    className="transition-colors duration-300"
                  />
                  
                  {/* Rocket/Point */}
                  {status === 'playing' && (
                    <g transform={`translate(${Math.min(300, (multiplier - 1) * 30)}, ${Math.max(0, 200 - Math.pow(multiplier - 1, 1.4) * 15)})`}>
                      {/* Flame effect using SVG elements */}
                      <motion.circle
                        r="12"
                        fill="url(#flameGradient)"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                      />
                      <motion.g
                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                      >
                        <circle r="10" fill="#3b82f6" className="blur-[2px]" />
                        <circle r="6" fill="white" />
                      </motion.g>
                      
                      <defs>
                        <radialGradient id="flameGradient">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                    </g>
                  )}
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full space-y-6 z-10">
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Выберите ставку</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Макс: 100 💎</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BET_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => setBet(option)}
                  className={`py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                    bet === option 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          {status === 'idle' ? (
            <button
              onClick={startRound}
              disabled={!canStart}
              className={`w-full py-6 rounded-[28px] font-black text-xl uppercase tracking-widest transition-all shadow-2xl ${
                canStart 
                  ? 'bg-blue-600 text-white shadow-blue-600/20 active:scale-95' 
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              {attemptsLeft <= 0 ? 'Нет попыток' : user && user.currentBalances.crystals < bet ? 'Недостаточно 💎' : 'Старт'}
            </button>
          ) : status === 'playing' ? (
            <button
              onClick={cashOut}
              className="w-full py-6 bg-emerald-600 text-white rounded-[28px] font-black text-xl uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
            >
              Забрать {(bet * multiplier).toFixed(0)} 💎
            </button>
          ) : (
            <div className="w-full py-6 bg-slate-900 text-slate-500 rounded-[28px] font-black text-xl uppercase tracking-widest text-center border border-white/5">
              {status === 'crashed' ? 'CRASHED' : 'УСПЕХ!'}
            </div>
          )}
        </div>

        {status === 'idle' && attemptsLeft <= 0 && (
          <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
            Возвращайся завтра за новыми попытками!
          </p>
        )}
      </div>

      {/* Game Over Shake Effect */}
      {status === 'crashed' && (
        <motion.div
          initial={{ x: -10 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 1000, damping: 10 }}
          className="absolute inset-0 pointer-events-none border-4 border-red-500/50 z-[2000]"
        />
      )}
    </div>
  );
};
