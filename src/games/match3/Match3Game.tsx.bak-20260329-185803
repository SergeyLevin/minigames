import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Target, Hash, RotateCcw } from 'lucide-react';
import { Button } from '../../shared/components';
import confetti from 'canvas-confetti';

interface Tile {
  id: string;
  type: number;
  x: number;
  y: number;
}

const GRID_SIZE = 7;
const TILE_TYPES = 5;
const TARGET_SCORE = 4500;
const MAX_MOVES = 35;

const COLORS = [
  'from-rose-400 to-rose-600 border-rose-700/30',    // Red
  'from-sky-400 to-sky-600 border-sky-700/30',     // Blue
  'from-emerald-400 to-emerald-600 border-emerald-700/30', // Green
  'from-amber-300 to-amber-500 border-amber-600/30',   // Yellow
  'from-purple-400 to-purple-600 border-purple-700/30',  // Purple
];

const SHAPES = [
  'rounded-full',   // Circle
  'rounded-2xl',    // Square
  'rounded-[40%]',  // Squircle
  'rounded-tr-[60%] rounded-bl-[60%]', // Leaf
  'rounded-tl-[60%] rounded-br-[60%]', // Diamond
];

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
}

export const Match3Game = ({ onUpdate, onMove, onEnd }: { 
  onUpdate: (s: number) => void, 
  onMove: () => void, 
  onEnd: (s: number, m: number, v: boolean, q: number) => void 
}) => {
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selected, setSelected] = useState<{x: number, y: number} | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combo, setCombo] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboText, setComboText] = useState<{text: string, x: number, y: number} | null>(null);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const idCounter = useRef(0);
  const generateId = () => `tile-${idCounter.current++}`;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const spawnParticles = (x: number, y: number, colorIndex: number) => {
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: `p-${Date.now()}-${x}-${y}-${i}`,
      x: x * 50 + 25,
      y: y * 50 + 25,
      color: COLORS[colorIndex].split(' ')[0].replace('from-', 'bg-')
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  };

  const hasPossibleMoves = (currentGrid: Tile[][]) => {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Try horizontal swap
        if (x < GRID_SIZE - 1) {
          const tempGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
          const tempType = tempGrid[y][x].type;
          tempGrid[y][x].type = tempGrid[y][x + 1].type;
          tempGrid[y][x + 1].type = tempType;
          if (findMatches(tempGrid).length > 0) return true;
        }
        // Try vertical swap
        if (y < GRID_SIZE - 1) {
          const tempGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
          const tempType = tempGrid[y][x].type;
          tempGrid[y][x].type = tempGrid[y + 1][x].type;
          tempGrid[y + 1][x].type = tempType;
          if (findMatches(tempGrid).length > 0) return true;
        }
      }
    }
    return false;
  };

  const shuffleBoard = (currentGrid: Tile[][]) => {
    let newGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
    let attempts = 0;
    
    do {
      // Flatten and shuffle types
      const types = newGrid.flat().map(t => t.type);
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      
      // Reassign types
      let idx = 0;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          newGrid[y][x].type = types[idx++];
        }
      }
      attempts++;
    } while ((findMatches(newGrid).length > 0 || !hasPossibleMoves(newGrid)) && attempts < 100);
    
    return newGrid;
  };

  // Initialize board without initial matches
  const initBoard = useCallback(() => {
    let newGrid: Tile[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      newGrid[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let type;
        do {
          type = Math.floor(Math.random() * TILE_TYPES);
        } while (
          (x >= 2 && newGrid[y][x - 1].type === type && newGrid[y][x - 2].type === type) ||
          (y >= 2 && newGrid[y - 1][x].type === type && newGrid[y - 2][x].type === type)
        );
        newGrid[y][x] = { id: generateId(), type, x, y };
      }
    }
    
    if (!hasPossibleMoves(newGrid)) {
      newGrid = shuffleBoard(newGrid);
    }
    
    setGrid(newGrid);
    setScore(0);
    setMoves(0);
    setCombo(1);
    setMessage(null);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const findMatches = (currentGrid: Tile[][]) => {
    const matches = new Set<string>();
    
    // Horizontal
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 2; x++) {
        const type = currentGrid[y][x].type;
        if (type === -1) continue;
        if (currentGrid[y][x + 1].type === type && currentGrid[y][x + 2].type === type) {
          matches.add(`${x},${y}`);
          matches.add(`${x + 1},${y}`);
          matches.add(`${x + 2},${y}`);
          // Check for 4 or 5
          let nextX = x + 3;
          while (nextX < GRID_SIZE && currentGrid[y][nextX].type === type) {
            matches.add(`${nextX},${y}`);
            nextX++;
          }
        }
      }
    }
    
    // Vertical
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE - 2; y++) {
        const type = currentGrid[y][x].type;
        if (type === -1) continue;
        if (currentGrid[y + 1][x].type === type && currentGrid[y + 2][x].type === type) {
          matches.add(`${x},${y}`);
          matches.add(`${x},${y + 1}`);
          matches.add(`${x},${y + 2}`);
          // Check for 4 or 5
          let nextY = y + 3;
          while (nextY < GRID_SIZE && currentGrid[nextY][x].type === type) {
            matches.add(`${x},${nextY}`);
            nextY++;
          }
        }
      }
    }
    
    return Array.from(matches).map(s => {
      const [x, y] = s.split(',').map(Number);
      return { x, y };
    });
  };

  const resolveBoard = async (currentGrid: Tile[][], currentCombo: number) => {
    const matches = findMatches(currentGrid);
    
    if (matches.length === 0) {
      // Check if any moves are possible after stabilization
      if (!hasPossibleMoves(currentGrid)) {
        setMessage('Нет ходов — перемешиваем!');
        setTimeout(() => {
          const shuffled = shuffleBoard(currentGrid);
          setGrid(shuffled);
          setMessage(null);
          setIsProcessing(false);
        }, 1500);
      } else {
        setIsProcessing(false);
      }
      
      setCombo(1);
      
      // Check game end conditions
      if (score >= TARGET_SCORE) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#007AFF', '#FF2D55', '#34C759', '#FFCC00', '#AF52DE']
        });
        onEnd(score, moves, true, 1.0);
      } else if (moves >= MAX_MOVES) {
        onEnd(score, moves, false, Math.min(1, score / TARGET_SCORE));
      }
      return;
    }

    // 1. Remove matches
    const newGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
    matches.forEach(({ x, y }) => {
      const type = newGrid[y][x].type;
      if (type !== -1) spawnParticles(x, y, type);
      newGrid[y][x].type = -1;
    });

    if (currentCombo > 1) {
      const midX = matches.reduce((acc, m) => acc + m.x, 0) / matches.length;
      const midY = matches.reduce((acc, m) => acc + m.y, 0) / matches.length;
      setComboText({ text: `Combo x${currentCombo}`, x: midX, y: midY });
      setTimeout(() => setComboText(null), 800);
      if (currentCombo > 2) triggerShake();
    }

    // Calculate score
    const points = matches.length * 50 * currentCombo;
    setScore(prev => {
      const next = prev + points;
      onUpdate(next);
      return next;
    });

    setGrid([...newGrid]);
    await new Promise(r => setTimeout(r, 200));

    // 2. Gravity
    for (let x = 0; x < GRID_SIZE; x++) {
      let emptySpaces = 0;
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        if (newGrid[y][x].type === -1) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          const tile = newGrid[y][x];
          newGrid[y + emptySpaces][x] = { ...tile, y: y + emptySpaces };
          newGrid[y][x] = { id: '', type: -1, x, y };
        }
      }
      // 3. Refill
      for (let i = 0; i < emptySpaces; i++) {
        const y = emptySpaces - 1 - i;
        newGrid[y][x] = {
          id: generateId(),
          type: Math.floor(Math.random() * TILE_TYPES),
          x,
          y
        };
      }
    }

    setGrid([...newGrid]);
    await new Promise(r => setTimeout(r, 300));
    
    // 4. Recursive check for combos
    resolveBoard(newGrid, currentCombo + 1);
  };

  const handleSwap = async (x1: number, y1: number, x2: number, y2: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setMoves(prev => prev + 1);
    onMove();

    const newGrid = grid.map(row => row.map(tile => ({ ...tile })));
    
    // Perform swap
    const tempType = newGrid[y1][x1].type;
    const tempId = newGrid[y1][x1].id;
    
    newGrid[y1][x1].type = newGrid[y2][x2].type;
    newGrid[y1][x1].id = newGrid[y2][x2].id;
    
    newGrid[y2][x2].type = tempType;
    newGrid[y2][x2].id = tempId;

    setGrid([...newGrid]);
    await new Promise(r => setTimeout(r, 300));

    const matches = findMatches(newGrid);
    if (matches.length > 0) {
      resolveBoard(newGrid, 1);
    } else {
      setMessage('Нет совпадений!');
      setTimeout(() => setMessage(null), 1000);
      
      // Swap back
      newGrid[y2][x2].type = newGrid[y1][x1].type;
      newGrid[y2][x2].id = newGrid[y1][x1].id;
      
      newGrid[y1][x1].type = tempType;
      newGrid[y1][x1].id = tempId;
      
      setGrid([...newGrid]);
      await new Promise(r => setTimeout(r, 300));
      setIsProcessing(false);
      // Don't count move if invalid swap
      setMoves(prev => prev - 1);
    }
  };

  const onTileClick = (x: number, y: number) => {
    if (isProcessing) return;
    
    if (!selected) {
      setSelected({ x, y });
    } else {
      const dx = Math.abs(selected.x - x);
      const dy = Math.abs(selected.y - y);
      
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        handleSwap(selected.x, selected.y, x, y);
      }
      setSelected(null);
    }
  };

  // Swipe logic
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent, x: number, y: number) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setSelected({ x, y });
  };

  const handleTouchEnd = (e: React.TouchEvent, x: number, y: number) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      let targetX = x;
      let targetY = y;
      if (absX > absY) {
        targetX = dx > 0 ? x + 1 : x - 1;
      } else {
        targetY = dy > 0 ? y + 1 : y - 1;
      }

      if (targetX >= 0 && targetX < GRID_SIZE && targetY >= 0 && targetY < GRID_SIZE) {
        handleSwap(x, y, targetX, targetY);
      }
    }
    touchStart.current = null;
    setSelected(null);
  };

  const progress = Math.min(100, (score / TARGET_SCORE) * 100);

  return (
    <div className="p-4 flex flex-col items-center justify-between h-full bg-slate-50 select-none touch-none">
      {/* Stats Header */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center px-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="bg-rose-50 p-1.5 rounded-lg">
              <Hash className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ходы</p>
              <p className="text-lg font-black text-slate-700 leading-none">{MAX_MOVES - moves}</p>
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 text-right">
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Счет</p>
              <p className="text-lg font-black text-blue-600 leading-none">{score}</p>
            </div>
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-2">
          <div className="flex justify-between items-end mb-1.5">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
              <Target className="w-3 h-3" />
              Цель: {TARGET_SCORE}
            </p>
            <p className="text-[10px] font-black text-blue-600">{Math.floor(progress)}%</p>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className={`
        relative aspect-square w-full max-w-[360px] bg-slate-200/50 p-2 rounded-[32px] shadow-inner border border-white
        ${shake ? 'animate-shake' : ''}
      `}>
        <div className="grid grid-cols-7 gap-1.5 h-full w-full relative">
          {grid.map((row, y) => row.map((tile, x) => (
            <div 
              key={`${x}-${y}`} 
              className="relative aspect-square"
              onTouchStart={(e) => handleTouchStart(e, x, y)}
              onTouchEnd={(e) => handleTouchEnd(e, x, y)}
              onClick={() => onTileClick(x, y)}
            >
              <AnimatePresence mode="popLayout">
                {tile.type !== -1 && (
                  <motion.div
                    key={tile.id}
                    layoutId={tile.id}
                    initial={{ scale: 0, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ 
                      scale: 1.4, 
                      opacity: 0,
                      filter: 'brightness(2)',
                      transition: { duration: 0.2 }
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 400, 
                      damping: 20,
                      mass: 0.8
                    }}
                    className={`
                      absolute inset-0 m-0.5 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] cursor-pointer
                      bg-gradient-to-br border-b-2 ${COLORS[tile.type]} ${SHAPES[tile.type]}
                      ${selected?.x === x && selected?.y === y ? 'ring-4 ring-white scale-110 z-10 shadow-xl' : ''}
                    `}
                  >
                    {/* Shine effect */}
                    <div className="absolute top-1 left-1.5 w-1/3 h-1/4 bg-white/40 rounded-full blur-[1px] rotate-[-15deg]" />
                    <div className="absolute bottom-1 right-1 w-1/4 h-1/4 bg-black/5 rounded-full blur-[2px]" />
                    <div className="absolute inset-0 border-t border-white/30 rounded-inherit" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )))}

          {/* Particles Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <AnimatePresence>
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
                  animate={{ 
                    x: p.x + (Math.random() - 0.5) * 100, 
                    y: p.y + (Math.random() - 0.5) * 100,
                    scale: 0,
                    opacity: 0
                  }}
                  className={`absolute w-2 h-2 rounded-full ${p.color} shadow-sm`}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Combo Text Layer */}
          <AnimatePresence>
            {comboText && (
              <motion.div
                initial={{ scale: 0, y: 0, opacity: 0 }}
                animate={{ scale: 1.5, y: -40, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute z-50 pointer-events-none font-black text-blue-600 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] text-xl italic"
                style={{ 
                  left: `${(comboText.x / GRID_SIZE) * 100}%`, 
                  top: `${(comboText.y / GRID_SIZE) * 100}%` 
                }}
              >
                {comboText.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Layer */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl border border-blue-100">
                  <p className="text-blue-600 font-black text-sm uppercase tracking-widest">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {score >= TARGET_SCORE ? 'Цель достигнута!' : `Нужно еще ${Math.max(0, TARGET_SCORE - score)}`}
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={initBoard} 
          className="w-auto px-6 py-2 rounded-xl text-[10px] font-bold text-slate-400 border border-slate-200 bg-transparent shadow-none hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-3 h-3" /> Сбросить
        </Button>
      </div>
    </div>
  );
};


