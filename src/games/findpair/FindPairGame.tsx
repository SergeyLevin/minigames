import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Heart, 
  Star, 
  Moon, 
  Sun, 
  Cloud, 
  Ghost, 
  Flame, 
  Droplets, 
  Leaf, 
  Music, 
  Camera, 
  Gift, 
  Coffee,
  Pizza,
  Rocket,
  Gamepad2,
  Anchor,
  HelpCircle,
  Sparkles,
  Clock,
  RotateCcw
} from 'lucide-react';

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface FindPairGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onUpdate: (score: number) => void;
  onMove: () => void;
  onEnd: (score: number, moves: number, isVictory: boolean, qualityBonus: number) => void;
}

const ICONS = [
  Heart, Star, Moon, Sun, Cloud, Ghost, Flame, Droplets, 
  Leaf, Music, Camera, Gift, Coffee, Pizza, Rocket, 
  Gamepad2, Anchor
];

const DIFFICULTY_CONFIG = {
  easy: { cards: 12, pairs: 6, moves: 12, gridCols: 3 },
  medium: { cards: 20, pairs: 10, moves: 18, gridCols: 4 },
  hard: { cards: 30, pairs: 15, moves: 24, gridCols: 5 }
};

export const FindPairGame: React.FC<FindPairGameProps> = ({ 
  difficulty = 'easy', 
  onUpdate, 
  onMove, 
  onEnd 
}) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(0);

  const scoreRef = useRef(0);
  const movesRef = useRef(0);
  const matchedPairsRef = useRef(0);

  // Initialize board
  const initBoard = useCallback(() => {
    const numPairs = config.pairs;
    const selectedIcons = Array.from({ length: numPairs }, (_, i) => i);
    const cardPairs = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((iconId, index) => ({
        id: index,
        iconId,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(cardPairs);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setScore(0);
    scoreRef.current = 0;
    movesRef.current = 0;
    matchedPairsRef.current = 0;
  }, [config]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Sync score with parent
  useEffect(() => {
    onUpdate(score);
  }, [score, onUpdate]);

  const handleCardClick = (index: number) => {
    if (isProcessing || moves >= config.moves || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(prev => {
        const next = prev + 1;
        movesRef.current = next;
        return next;
      });
      onMove();

      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].iconId === cards[secondIndex].iconId) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          matchedPairsRef.current = newMatchedPairs;
          
          const points = 100 + (config.moves - movesRef.current) * 10;
          setScore(prev => {
            const next = prev + points;
            scoreRef.current = next;
            return next;
          });

          setFlippedIndices([]);
          setIsProcessing(false);

          // Check win
          if (newMatchedPairs === config.pairs) {
            const qualityBonus = Math.max(0, (config.moves - movesRef.current) / config.moves);
            onEnd(scoreRef.current, movesRef.current, true, qualityBonus);
          } else if (movesRef.current >= config.moves) {
            // Match found but no moves left for remaining pairs
            onEnd(scoreRef.current, movesRef.current, false, newMatchedPairs / config.pairs);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const closedCards = [...newCards];
          closedCards[firstIndex].isFlipped = false;
          closedCards[secondIndex].isFlipped = false;
          setCards(closedCards);
          setFlippedIndices([]);
          setIsProcessing(false);

          // Check lose
          if (movesRef.current >= config.moves) {
            onEnd(scoreRef.current, movesRef.current, false, matchedPairsRef.current / config.pairs);
          }
        }, 1000);
      }
    }
  };

  const progress = (matchedPairs / config.pairs) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 h-full overflow-y-auto">
      {/* Stats Header */}
      <div className="w-full bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Сложность</p>
              <p className="text-sm font-black text-slate-800 capitalize">
                {difficulty === 'easy' ? 'Легкий' : difficulty === 'medium' ? 'Средний' : 'Сложный'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Попытки</p>
            <p className="text-lg font-black text-blue-600 leading-none">
              {Math.max(0, config.moves - moves)} <span className="text-[10px] text-slate-300">/ {config.moves}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
              <Target className="w-3 h-3" />
              Пары: {matchedPairs} / {config.pairs}
            </p>
            <p className="text-[10px] font-black text-blue-600">{Math.floor(progress)}%</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className="grid gap-2 w-full"
        style={{ 
          gridTemplateColumns: `repeat(${config.gridCols}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card, index) => {
          const Icon = ICONS[card.iconId % ICONS.length];
          return (
            <div
              key={card.id}
              className="aspect-square relative perspective-1000"
              onClick={() => handleCardClick(index)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Card Back */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent" />
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-blue-200" />
                  </div>
                </div>

                {/* Card Front */}
                <div 
                  className={`
                    absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center shadow-md
                    ${card.isMatched ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-blue-100'}
                    border-2
                  `}
                >
                  <Icon 
                    className={`
                      w-1/2 h-1/2 
                      ${card.isMatched ? 'text-emerald-500' : 'text-blue-600'}
                    `} 
                  />
                  {card.isMatched && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-sm"
                    >
                      <Trophy className="w-2 h-2 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Совет</p>
        <p className="text-xs text-slate-500 font-medium px-8">
          Запоминай расположение карточек, чтобы тратить меньше попыток и получить больше кристаллов!
        </p>
      </div>
    </div>
  );
};

// CSS for 3D flip effect
const style = document.createElement('style');
style.textContent = `
  .perspective-1000 { perspective: 1000px; }
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
`;
document.head.appendChild(style);
