import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStackStore } from './stackStore';
import { Sparkles } from 'lucide-react';

interface Block {
  id: number;
  x: number;
  width: number;
  y: number;
  color: string;
}

const COLORS = [
  '#475569', '#64748b', '#94a3b8', '#cbd5e1', 
  '#1e293b', '#334155', '#4b5563', '#374151'
];

const BLOCK_HEIGHT = 40;

const BuildingFloor = ({ width, color, isCurrent = false }: { width: string, color: string, isCurrent?: boolean }) => {
  return (
    <div 
      className={`h-full w-full relative rounded-sm border-b-2 border-black/20 shadow-inner flex flex-col items-center justify-center gap-1 overflow-hidden`}
      style={{ backgroundColor: color }}
    >
      {/* 2x2 Windows Grid */}
      <div className="grid grid-cols-2 gap-1">
        <div className="w-2 h-3 bg-yellow-100/40 rounded-sm border border-black/10 shadow-inner" />
        <div className="w-2 h-3 bg-yellow-100/40 rounded-sm border border-black/10 shadow-inner" />
        <div className="w-2 h-3 bg-yellow-100/40 rounded-sm border border-black/10 shadow-inner" />
        <div className="w-2 h-3 bg-yellow-100/40 rounded-sm border border-black/10 shadow-inner" />
      </div>
      {/* Texture/Details */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      {isCurrent && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
    </div>
  );
};

export const StackGame = ({ onUpdate, onMove, onEnd }: any) => {
  const { level, blockWidth, speed, status, reset, nextLevel, setGameOver, startGame } = useStackStore();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 0, x: 37.5, width: 25, y: 0, color: COLORS[0] }
  ]);
  const [currentX, setCurrentX] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPerfect, setIsPerfect] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [slicedBlock, setSlicedBlock] = useState<{ x: number, width: number, color: string } | null>(null);
  
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);
  const startTimeRef = useRef<number>(Date.now());

  const gameContainerRef = useRef<HTMLDivElement>(null);

  const handleEnd = useCallback(() => {
    const duration = Date.now() - startTimeRef.current;
    onEnd(level, level, false, level / 20); // quality bonus based on height
  }, [level, onEnd]);

  useEffect(() => {
    if (status === 'gameover') {
      handleEnd();
    }
  }, [status, handleEnd]);

  // Movement loop
  const animate = useCallback((time: number) => {
    if (status !== 'playing' || isFalling) return;

    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      const moveAmount = (100 / speed) * deltaTime;
      
      setCurrentX(prevX => {
        let nextX = prevX + moveAmount * direction;
        if (nextX >= 100 - blockWidth) {
          setDirection(-1);
          return 100 - blockWidth;
        }
        if (nextX <= 0) {
          setDirection(1);
          return 0;
        }
        return nextX;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [status, speed, direction, blockWidth, isFalling]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleTap = () => {
    if (status === 'idle') {
      startGame();
      return;
    }
    if (status !== 'playing' || isFalling) return;

    setIsFalling(true);
    onMove();

    // Logic for landing
    setTimeout(() => {
      const prevBlock = blocks[blocks.length - 1];
      const leftEdge = Math.max(currentX, prevBlock.x);
      const rightEdge = Math.min(currentX + blockWidth, prevBlock.x + prevBlock.width);
      const newWidth = rightEdge - leftEdge;

      if (newWidth <= 0) {
        setGameOver();
        setIsFalling(false);
        return;
      }

      // Check for perfect hit (within 2% tolerance)
      const diff = Math.abs(currentX - prevBlock.x);
      const perfect = diff < 2;
      
      let finalX = leftEdge;
      let finalWidth = newWidth;

      if (perfect) {
        finalX = prevBlock.x;
        finalWidth = prevBlock.width;
        setIsPerfect(true);
        setTimeout(() => setIsPerfect(false), 1000);
      } else {
        // Calculate sliced part
        const sliceX = currentX < prevBlock.x ? currentX : rightEdge;
        const sliceWidth = blockWidth - newWidth;
        setSlicedBlock({ x: sliceX, width: sliceWidth, color: COLORS[(level + 1) % COLORS.length] });
        setTimeout(() => setSlicedBlock(null), 1000);
      }

      const newBlock: Block = {
        id: level + 1,
        x: finalX,
        width: finalWidth,
        y: (level + 1) * BLOCK_HEIGHT, // 40px height per block
        color: COLORS[(level + 1) % COLORS.length]
      };

      setBlocks(prev => [...prev, newBlock]);
      nextLevel(finalWidth);
      onUpdate(level + 1);
      setIsFalling(false);
      
      // Reset position for next block
      setCurrentX(direction === 1 ? 0 : 100 - finalWidth);
    }, 300); // Animation duration for "falling"
  };

  useEffect(() => {
    reset();
  }, [reset]);

  // Camera offset to keep the top of the tower visible
  const cameraY = Math.max(0, (level - 5) * BLOCK_HEIGHT);

  return (
    <div 
      ref={gameContainerRef}
      className="w-full h-full flex flex-col items-center justify-end overflow-hidden relative touch-none select-none bg-sky-900"
      onClick={handleTap}
    >
      {/* Background: City Silhouette */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-800 to-slate-900 opacity-80" />
      <div className="absolute bottom-0 w-full h-40 bg-slate-950/40 blur-xl" />

      {/* Perfect Indicator */}
      <AnimatePresence>
        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <Sparkles className="text-yellow-400 w-12 h-12 mb-2" />
              <span className="text-yellow-400 font-black text-4xl italic tracking-tighter drop-shadow-2xl">
                PERFECT!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Counter */}
      <div className="absolute top-20 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
        <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Floors Built</span>
        <span className="text-white text-6xl font-black tabular-nums drop-shadow-lg">{level}</span>
      </div>

      {/* Instructions */}
      {status === 'idle' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[2px]"
        >
          <div className="text-center p-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white font-black text-2xl uppercase tracking-tight mb-4"
            >
              Нажми, чтобы сбросить этаж
            </motion.div>
            <p className="text-white/60 text-sm font-medium">Построй самый высокий небоскреб!</p>
          </div>
        </motion.div>
      )}

      {/* Game World */}
      <div 
        className="w-full max-w-[400px] h-full relative transition-transform duration-500 ease-out"
        style={{ transform: `translateY(${cameraY}px)` }}
      >
        {/* Stacked Blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute bottom-0 z-10"
            style={{
              left: `${block.x}%`,
              width: `${block.width}%`,
              bottom: `${block.y}px`,
              height: `${BLOCK_HEIGHT}px`,
              zIndex: block.id
            }}
          >
            <BuildingFloor width={`${block.width}`} color={block.color} />
          </div>
        ))}

        {/* Current Moving Block */}
        {status === 'playing' && (
          <motion.div
            className={`absolute z-[1000]`}
            animate={{ 
              bottom: isFalling ? level * BLOCK_HEIGHT : (level + 1) * BLOCK_HEIGHT,
              opacity: 1
            }}
            transition={{ 
              bottom: { type: 'spring', damping: 20, stiffness: 150 } 
            }}
            style={{
              left: `${currentX}%`,
              width: `${blockWidth}%`,
              height: `${BLOCK_HEIGHT}px`,
            }}
          >
            <BuildingFloor width={`${blockWidth}`} color={COLORS[(level + 1) % COLORS.length]} isCurrent />
          </motion.div>
        )}

        {/* Sliced Part Falling */}
        <AnimatePresence>
          {slicedBlock && (
            <motion.div
              initial={{ opacity: 1, y: 0, rotate: 0 }}
              animate={{ opacity: 0, y: 500, rotate: 45 }}
              className="absolute z-[500]"
              style={{
                left: `${slicedBlock.x}%`,
                width: `${slicedBlock.width}%`,
                bottom: `${level * BLOCK_HEIGHT}px`,
                height: `${BLOCK_HEIGHT}px`,
              }}
            >
              <div className="w-full h-full rounded-sm opacity-50" style={{ backgroundColor: slicedBlock.color }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Over Shake */}
      {status === 'gameover' && (
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
