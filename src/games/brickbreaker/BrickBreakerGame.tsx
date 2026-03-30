import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trophy, Zap, Sparkles, Shield, Maximize2, MousePointer2, FastForward, Target } from 'lucide-react';

interface BrickBreakerProps {
  onUpdate: (score: number) => void;
  onMove: () => void;
  onEnd: (score: number, moves: number, isVictory: boolean, qualityBonus: number, metadata?: any) => void;
}

// --- Types ---
interface Point { x: number; y: number; }
interface Velocity { dx: number; dy: number; }

interface Ball {
  pos: Point;
  vel: Velocity;
  radius: number;
  isPiercing: boolean;
}

interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'strong' | 'unbreakable' | 'bonus';
  hits: number;
  color: string;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'triple' | 'wide' | 'slow' | 'pierce' | 'shield' | 'sticky';
  radius: number;
}

// --- Constants ---
const PADDLE_HEIGHT = 12;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 8;
const BRICK_ROWS = 8;
const BRICK_COLS = 8;
const BRICK_PADDING = 4;
const BRICK_HEIGHT = 20;

const COLORS = {
  normal: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'],
  strong: '#4B5563',
  unbreakable: '#1F2937',
  bonus: '#F472B6',
};

const POWERUP_ICONS = {
  triple: <Zap className="w-4 h-4 text-yellow-400" />,
  wide: <Maximize2 className="w-4 h-4 text-blue-400" />,
  slow: <FastForward className="w-4 h-4 text-emerald-400 rotate-180" />,
  pierce: <Target className="w-4 h-4 text-rose-400" />,
  shield: <Shield className="w-4 h-4 text-indigo-400" />,
  sticky: <MousePointer2 className="w-4 h-4 text-amber-400" />,
};

// --- Game Component ---
export const BrickBreakerGame: React.FC<BrickBreakerProps> = ({ onUpdate, onMove, onEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'levelclear'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Refs for mutable game objects (to avoid React render cycle overhead)
  const paddleRef = useRef({ x: 0, width: 80, isSticky: false, hasShield: false });
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // --- Level Generation ---
  const generateLevel = useCallback((lvl: number) => {
    const bricks: Brick[] = [];
    const width = dimensionsRef.current.width;
    const brickWidth = (width - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    
    // Patterns
    const patterns = ['wall', 'checker', 'stairs', 'diamond', 'arch', 'wave', 'cage', 'maze', 'fortress'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Randomize some parameters for each level, increasing difficulty with lvl
    const cageSize = 2 + Math.floor(Math.random() * 2);
    const mazeDensity = Math.min(0.7, 0.3 + (lvl * 0.05) + Math.random() * 0.2);
    const unbreakableChance = Math.min(0.3, 0.1 + (lvl * 0.02));

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        let shouldCreate = false;
        let forcedType: Brick['type'] | null = null;
        
        switch (pattern) {
          case 'wall': shouldCreate = r < 5; break;
          case 'checker': shouldCreate = (r + c) % 2 === 0 && r < 6; break;
          case 'stairs': shouldCreate = c >= r && r < 6; break;
          case 'diamond': {
            const mid = Math.floor(BRICK_COLS / 2);
            shouldCreate = Math.abs(c - mid) + Math.abs(r - 2) <= 3;
            break;
          }
          case 'arch': shouldCreate = (r === 0) || (c === 0 || c === BRICK_COLS - 1) && r < 5; break;
          case 'wave': shouldCreate = r < 4 + Math.sin(c * 0.8) * 2; break;
          case 'cage': {
            // Create a box of unbreakable bricks with normal ones inside
            const midC = Math.floor(BRICK_COLS / 2);
            const midR = 2;
            const distC = Math.abs(c - midC);
            const distR = Math.abs(r - midR);
            
            if (distC <= cageSize && distR <= cageSize) {
              shouldCreate = true;
              if (distC === cageSize || distR === cageSize) {
                // The border is unbreakable, but leave one opening
                if (!(r === midR + cageSize && distC === 0)) {
                  forcedType = 'unbreakable';
                } else {
                  shouldCreate = false; // The opening
                }
              }
            }
            break;
          }
          case 'maze': {
            shouldCreate = r < 7 && Math.random() < mazeDensity;
            if (shouldCreate && Math.random() < 0.3) forcedType = 'unbreakable';
            break;
          }
          case 'fortress': {
            // Central core protected by outer walls
            if (r < 6) {
              shouldCreate = true;
              if (r === 0 || r === 5 || c === 0 || c === BRICK_COLS - 1) {
                forcedType = 'unbreakable';
              } else if (r === 1 || r === 4 || c === 1 || c === BRICK_COLS - 2) {
                shouldCreate = false; // Gap between wall and core
              }
            }
            break;
          }
        }

        if (shouldCreate) {
          const rand = Math.random();
          let type: Brick['type'] = forcedType || 'normal';
          let hits = 1;
          let color = COLORS.normal[Math.floor(Math.random() * COLORS.normal.length)];

          if (type === 'unbreakable') {
            hits = Infinity;
            color = COLORS.unbreakable;
          } else if (type === 'normal') {
            if (rand < unbreakableChance && !forcedType) {
              type = 'unbreakable';
              hits = Infinity;
              color = COLORS.unbreakable;
            } else if (rand < 0.25) {
              type = 'strong';
              hits = 2;
              color = COLORS.strong;
            } else if (rand < 0.35) {
              type = 'bonus';
              hits = 1;
              color = COLORS.bonus;
            }
          } else if (type === 'strong') {
            hits = 2;
            color = COLORS.strong;
          } else if (type === 'bonus') {
            hits = 1;
            color = COLORS.bonus;
          }

          bricks.push({
            id: r * BRICK_COLS + c,
            x: BRICK_PADDING + c * (brickWidth + BRICK_PADDING),
            y: 60 + r * (BRICK_HEIGHT + BRICK_PADDING),
            width: brickWidth,
            height: BRICK_HEIGHT,
            type,
            hits,
            color
          });
        }
      }
    }
    bricksRef.current = bricks;
  }, []);

  // --- Initialization ---
  const initGame = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    dimensionsRef.current = { width: clientWidth, height: clientHeight };
    
    if (canvasRef.current) {
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
    }

    paddleRef.current = {
      x: (clientWidth - 80) / 2,
      width: 80,
      isSticky: false,
      hasShield: false
    };

    ballsRef.current = [{
      pos: { x: clientWidth / 2, y: clientHeight - 50 },
      vel: { dx: (Math.random() - 0.5) * 4, dy: -INITIAL_BALL_SPEED },
      radius: 6,
      isPiercing: false
    }];

    powerUpsRef.current = [];
    generateLevel(level);
    setGameState('idle');
  }, [level, generateLevel]);

  useEffect(() => {
    initGame();
    window.addEventListener('resize', initGame);
    return () => window.removeEventListener('resize', initGame);
  }, [initGame]);

  // --- Game Loop ---
  const update = useCallback((time: number) => {
    if (gameState !== 'playing') return;

    const dt = Math.min(time - lastTimeRef.current, 32) / 16; // Normalize to ~60fps
    lastTimeRef.current = time;

    const { width, height } = dimensionsRef.current;
    const paddle = paddleRef.current;
    const balls = ballsRef.current;
    const bricks = bricksRef.current;
    const powerUps = powerUpsRef.current;

    // 1. Update Power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      p.y += 3 * dt;

      // Collision with paddle
      if (p.y + p.radius > height - 30 - PADDLE_HEIGHT && 
          p.x > paddle.x && p.x < paddle.x + paddle.width) {
        applyPowerUp(p.type);
        powerUps.splice(i, 1);
        continue;
      }

      // Out of bounds
      if (p.y > height) {
        powerUps.splice(i, 1);
      }
    }

    // 2. Update Balls
    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];
      
      // Move
      ball.pos.x += ball.vel.dx * dt;
      ball.pos.y += ball.vel.dy * dt;

      // Wall collisions
      if (ball.pos.x - ball.radius < 0 || ball.pos.x + ball.radius > width) {
        ball.vel.dx *= -1;
        ball.pos.x = ball.pos.x < width / 2 ? ball.radius : width - ball.radius;
      }
      if (ball.pos.y - ball.radius < 0) {
        ball.vel.dy *= -1;
        ball.pos.y = ball.radius;
      }

      // Paddle collision
      if (ball.vel.dy > 0 && 
          ball.pos.y + ball.radius > height - 30 - PADDLE_HEIGHT && 
          ball.pos.y - ball.radius < height - 30 &&
          ball.pos.x > paddle.x && ball.pos.x < paddle.x + paddle.width) {
        
        if (paddle.isSticky) {
          ball.vel.dx = 0;
          ball.vel.dy = 0;
          ball.pos.y = height - 30 - PADDLE_HEIGHT - ball.radius;
        } else {
          // Angle depends on hit position
          const hitPos = (ball.pos.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          const speed = Math.sqrt(ball.vel.dx ** 2 + ball.vel.dy ** 2);
          ball.vel.dx = hitPos * 5;
          ball.vel.dy = -Math.sqrt(Math.max(1, speed ** 2 - ball.vel.dx ** 2));
          ball.pos.y = height - 30 - PADDLE_HEIGHT - ball.radius;
        }
        onMove();
      }

      // Brick collisions
      for (let j = bricks.length - 1; j >= 0; j--) {
        const b = bricks[j];
        if (ball.pos.x + ball.radius > b.x && ball.pos.x - ball.radius < b.x + b.width &&
            ball.pos.y + ball.radius > b.y && ball.pos.y - ball.radius < b.y + b.height) {
          
          if (!ball.isPiercing) {
            // Determine which side was hit
            const overlapX = Math.min(ball.pos.x + ball.radius - b.x, b.x + b.width - (ball.pos.x - ball.radius));
            const overlapY = Math.min(ball.pos.y + ball.radius - b.y, b.y + b.height - (ball.pos.y - ball.radius));

            if (overlapX < overlapY) {
              ball.vel.dx *= -1;
            } else {
              ball.vel.dy *= -1;
            }
          }

          if (b.type !== 'unbreakable') {
            b.hits--;
            if (b.hits <= 0) {
              if (b.type === 'bonus' || Math.random() < 0.15) {
                spawnPowerUp(b.x + b.width / 2, b.y + b.height / 2);
              }
              bricks.splice(j, 1);
              setScore(s => {
                const newScore = s + 10;
                onUpdate(newScore);
                return newScore;
              });
            }
          }
          break; // Only hit one brick per frame per ball
        }
      }

      // Bottom collision
      if (ball.pos.y > height) {
        if (paddle.hasShield) {
          ball.vel.dy *= -1;
          ball.pos.y = height - 5;
          paddle.hasShield = false;
          setActivePowerUps(prev => prev.filter(p => p !== 'shield'));
          showTempMessage('Shield Used!');
        } else {
          balls.splice(i, 1);
        }
      }
    }

    // Check game over / level clear
    if (balls.length === 0) {
      if (lives > 1) {
        setLives(l => l - 1);
        resetBall();
      } else {
        setGameState('gameover');
        onEnd(score, level, false, score / 1000, { levelsCleared: level - 1, bricksDestroyed: Math.floor(score / 10) });
      }
    } else if (bricks.filter(b => b.type !== 'unbreakable').length === 0) {
      setGameState('levelclear');
      setTimeout(() => {
        setLevel(l => l + 1);
        generateLevel(level + 1);
        resetBall();
        setGameState('playing');
      }, 1500);
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameState, lives, score, level, onUpdate, onMove, onEnd, generateLevel]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensionsRef.current;
    const paddle = paddleRef.current;
    const balls = ballsRef.current;
    const bricks = bricksRef.current;
    const powerUps = powerUpsRef.current;

    ctx.clearRect(0, 0, width, height);

    // Draw Bricks
    bricks.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.width, b.height, 4);
      ctx.fill();
      
      // Highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (b.type === 'strong' && b.hits === 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(b.x + b.width / 2 - 2, b.y + 4, 4, b.height - 8);
      }
    });

    // Draw Paddle
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.roundRect(paddle.x, height - 30 - PADDLE_HEIGHT, paddle.width, PADDLE_HEIGHT, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (paddle.hasShield) {
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height - 2);
      ctx.lineTo(width, height - 2);
      ctx.stroke();
    }

    // Draw Balls
    balls.forEach(ball => {
      ctx.fillStyle = ball.isPiercing ? '#F43F5E' : '#FFFFFF';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ball.isPiercing ? 'rgba(244, 63, 94, 0.5)' : 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Power-ups
    powerUps.forEach(p => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  // --- Helpers ---
  const resetBall = () => {
    const { width, height } = dimensionsRef.current;
    ballsRef.current = [{
      pos: { x: paddleRef.current.x + paddleRef.current.width / 2, y: height - 50 },
      vel: { dx: (Math.random() - 0.5) * 4, dy: -INITIAL_BALL_SPEED },
      radius: 6,
      isPiercing: false
    }];
    paddleRef.current.isSticky = false;
    setActivePowerUps([]);
  };

  const spawnPowerUp = (x: number, y: number) => {
    const types: PowerUp['type'][] = ['triple', 'wide', 'slow', 'pierce', 'shield', 'sticky'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUpsRef.current.push({ id: Date.now(), x, y, type, radius: 10 });
  };

  const applyPowerUp = (type: PowerUp['type']) => {
    showTempMessage(type.toUpperCase());
    setActivePowerUps(prev => [...new Set([...prev, type])]);

    switch (type) {
      case 'triple':
        if (ballsRef.current.length > 0) {
          const main = ballsRef.current[0];
          ballsRef.current.push(
            { ...main, vel: { dx: main.vel.dx - 2, dy: main.vel.dy }, pos: { ...main.pos } },
            { ...main, vel: { dx: main.vel.dx + 2, dy: main.vel.dy }, pos: { ...main.pos } }
          );
        }
        break;
      case 'wide':
        paddleRef.current.width = 140;
        setTimeout(() => {
          paddleRef.current.width = 80;
          setActivePowerUps(prev => prev.filter(p => p !== 'wide'));
        }, 8000);
        break;
      case 'slow':
        ballsRef.current.forEach(b => {
          b.vel.dx *= 0.6;
          b.vel.dy *= 0.6;
        });
        setTimeout(() => {
          ballsRef.current.forEach(b => {
            b.vel.dx /= 0.6;
            b.vel.dy /= 0.6;
          });
          setActivePowerUps(prev => prev.filter(p => p !== 'slow'));
        }, 5000);
        break;
      case 'pierce':
        ballsRef.current.forEach(b => b.isPiercing = true);
        setTimeout(() => {
          ballsRef.current.forEach(b => b.isPiercing = false);
          setActivePowerUps(prev => prev.filter(p => p !== 'pierce'));
        }, 6000);
        break;
      case 'shield':
        paddleRef.current.hasShield = true;
        break;
      case 'sticky':
        paddleRef.current.isSticky = true;
        setTimeout(() => {
          paddleRef.current.isSticky = false;
          setActivePowerUps(prev => prev.filter(p => p !== 'sticky'));
        }, 10000);
        break;
    }
  };

  const showTempMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 1500);
  };

  // --- Handlers ---
  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState === 'idle') {
      setGameState('playing');
      return;
    }
    if (gameState !== 'playing') return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = clientX - rect.left;
      paddleRef.current.x = Math.max(0, Math.min(dimensionsRef.current.width - paddleRef.current.width, x - paddleRef.current.width / 2));
      
      // Release sticky ball
      if (paddleRef.current.isSticky) {
        ballsRef.current.forEach(b => {
          if (b.vel.dx === 0 && b.vel.dy === 0) {
            b.vel = { dx: (Math.random() - 0.5) * 4, dy: -INITIAL_BALL_SPEED };
          }
        });
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-slate-950 relative overflow-hidden touch-none select-none"
      onMouseMove={handleTouch}
      onTouchMove={handleTouch}
      onClick={() => gameState === 'idle' && setGameState('playing')}
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-white font-black text-sm">{lives}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-white font-black text-sm">{score}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mr-2">Level</span>
            <span className="text-white font-black text-sm">{level}</span>
          </div>
          
          {/* Active Power-ups Icons */}
          <div className="flex gap-1">
            {activePowerUps.map((p, i) => (
              <motion.div
                key={`${p}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
              >
                {POWERUP_ICONS[p as keyof typeof POWERUP_ICONS]}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute top-1/2 left-0 right-0 text-center pointer-events-none z-20"
          >
            <span className="text-white font-black text-4xl italic tracking-tighter drop-shadow-2xl uppercase">
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-30">
          <div className="text-center p-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h2 className="text-white font-black text-3xl uppercase tracking-tight mb-2">Brick Breaker</h2>
            <p className="text-white/60 text-sm font-medium mb-8">Двигай платформу и разбивай блоки</p>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
              Нажми, чтобы начать
            </div>
          </div>
        </div>
      )}

      {/* Level Clear Overlay */}
      {gameState === 'levelclear' && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm z-30">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-white font-black text-4xl uppercase tracking-tight">Level {level} Clear!</h2>
          </motion.div>
        </div>
      )}
    </div>
  );
};
