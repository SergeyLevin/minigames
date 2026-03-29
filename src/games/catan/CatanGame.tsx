import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '../../shared/components';
import confetti from 'canvas-confetti';
import { 
  TreePine, 
  Mountain, 
  Wheat, 
  Cloud, 
  BrickWall,
  Home, 
  Building2, 
  Zap,
  User,
  Cpu,
  Trophy,
  Dice6,
  ArrowRight,
  RefreshCw,
  Info,
  X,
  ShieldAlert,
  Hexagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---

type ResourceType = 'wood' | 'brick' | 'wool' | 'grain' | 'ore' | 'desert';
type GameMode = 'tutorial' | 'normal';

interface ResourceSet {
  wood: number;
  brick: number;
  wool: number;
  grain: number;
  ore: number;
}

interface Hex {
  id: number;
  q: number;
  r: number;
  resource: ResourceType;
  number: number;
}

interface Vertex {
  id: number;
  hexIds: number[];
  owner: string | null; // 'player', 'bot1', 'bot2'
  type: 'settlement' | 'city' | null;
  neighbors: number[]; // adjacent vertex IDs
}

interface Edge {
  id: number;
  vertexIds: [number, number];
  owner: string | null;
}

interface TutorialStep {
  id: number;
  type: 'info' | 'action' | 'mixed' | 'victory';
  title: string;
  text: string;
  reason?: string;
  targetType?: 'button' | 'hex' | 'vertex' | 'edge';
  targetId?: string | number;
  allowedActions?: string[];
  successCondition?: (state: any) => boolean;
  benefit?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  { 
    id: 1,
    type: 'info', 
    title: "Добро пожаловать!", 
    text: "Это остров Катан. Гексы дают ресурсы, когда выпадают их числа. Ваша цель — набрать 10 очков.",
    reason: "Понимание цели игры поможет вам строить правильную стратегию."
  },
  { 
    id: 2,
    type: 'action', 
    title: "Бросок кубиков", 
    text: "Нажмите кнопку 'Бросить кубики' внизу, чтобы начать ход и получить ресурсы.",
    reason: "Каждый ход начинается с броска. Числа на кубиках определяют, какие клетки принесут доход.",
    targetType: 'button',
    targetId: 'roll',
    allowedActions: ['roll']
  },
  { 
    id: 3,
    type: 'info', 
    title: "Ресурсы получены!", 
    text: "Выпало 6. Ваши поселения рядом с лесом (6) принесли вам дерево. Ресурсы отображаются внизу.",
    reason: "Дерево и кирпич — основа для строительства дорог и домов."
  },
  { 
    id: 4,
    type: 'action', 
    title: "Строительство дороги", 
    text: "Для расширения нужны дороги. Нажмите на кнопку 'Дорога'.",
    reason: "Дороги позволяют дотянуться до новых выгодных участков острова.",
    targetType: 'button',
    targetId: 'road',
    allowedActions: ['select_road']
  },
  { 
    id: 5,
    type: 'action', 
    title: "Размещение дороги", 
    text: "Теперь выберите подсвеченную линию на поле, чтобы проложить путь.",
    reason: "Мы строим дорогу в сторону кирпичного карьера, чтобы сбалансировать добычу.",
    targetType: 'edge',
    targetId: '7-1', // hex 7, edge 1
    benefit: "Путь к кирпичу",
    allowedActions: ['build_road']
  },
  { 
    id: 6,
    type: 'action', 
    title: "Новое поселение", 
    text: "Поселения дают очки и ресурсы. Нажмите на кнопку 'Дом'.",
    reason: "Каждое новое поселение — это +1 победное очко и больше ресурсов каждый ход.",
    targetType: 'button',
    targetId: 'settlement',
    allowedActions: ['select_settlement']
  },
  { 
    id: 7,
    type: 'action', 
    title: "Строим дом", 
    text: "Выберите подсвеченную точку на конце вашей новой дороги.",
    reason: "Эта точка находится на стыке леса и холмов — идеальное место для развития.",
    targetType: 'vertex',
    targetId: '7-1', // hex 7, pos 1
    benefit: "+1 Очко",
    allowedActions: ['build_settlement']
  },
  { 
    id: 8,
    type: 'info', 
    title: "Отличная работа!", 
    text: "Вы получили +1 победное очко! Теперь у вас 3 очка. Чем больше домов, тем больше ресурсов вы будете получать.",
    reason: "Вы успешно расширили свои владения и стали на шаг ближе к победе."
  },
  { 
    id: 9,
    type: 'action', 
    title: "Завершение хода", 
    text: "Нажмите 'Конец', чтобы передать ход. В обучении боты ходят быстро.",
    reason: "Передача хода позволяет другим игрокам попытать удачу, пока вы планируете следующий шаг.",
    targetType: 'button',
    targetId: 'end_turn',
    allowedActions: ['end_turn']
  },
  { 
    id: 10,
    type: 'info', 
    title: "Путь к победе", 
    text: "Продолжайте строить! Мы добавили вам ресурсов, чтобы вы могли сразу построить еще один дом и победить в этом обучении.",
    reason: "В реальной игре вам пришлось бы ждать бросков, но сейчас мы ускорим ваш триумф."
  },
  { 
    id: 11,
    type: 'victory', 
    title: "Вы победили!", 
    text: "Вы освоили основы Катана. Теперь вы готовы к настоящей игре против сильных противников!",
    reason: "Вы доказали, что понимаете основы экономики и строительства на острове."
  },
];

const RESOURCE_CONFIG: Record<ResourceType, { color: string; icon: any; label: string }> = {
  wood: { color: 'bg-emerald-600', icon: <TreePine className="w-4 h-4" />, label: 'Дерево' },
  brick: { color: 'bg-orange-700', icon: <BrickWall className="w-4 h-4" />, label: 'Кирпич' },
  wool: { color: 'bg-lime-500', icon: <Cloud className="w-4 h-4" />, label: 'Шерсть' },
  grain: { color: 'bg-amber-400', icon: <Wheat className="w-4 h-4" />, label: 'Зерно' },
  ore: { color: 'bg-slate-500', icon: <Mountain className="w-4 h-4" />, label: 'Руда' },
  desert: { color: 'bg-yellow-200', icon: <ShieldAlert className="w-4 h-4" />, label: 'Пустыня' },
};

const COSTS = {
  road: { wood: 1, brick: 1 },
  settlement: { wood: 1, brick: 1, wool: 1, grain: 1 },
  city: { grain: 2, ore: 3 },
};

// --- Board Generation Helpers ---

const generateTutorialBoard = () => {
  const hexes: Hex[] = [
    { id: 0, q: 0, r: -2, resource: 'wood', number: 10 },
    { id: 1, q: 1, r: -2, resource: 'wool', number: 2 },
    { id: 2, q: 2, r: -2, resource: 'grain', number: 9 },
    { id: 3, q: -1, r: -1, resource: 'brick', number: 11 },
    { id: 4, q: 0, r: -1, resource: 'ore', number: 3 },
    { id: 5, q: 1, r: -1, resource: 'grain', number: 8 },
    { id: 6, q: 2, r: -1, resource: 'wood', number: 4 },
    { id: 7, q: -2, r: 0, resource: 'brick', number: 5 },
    { id: 8, q: -1, r: 0, resource: 'grain', number: 6 },
    { id: 9, q: 0, r: 0, resource: 'desert', number: 0 },
    { id: 10, q: 1, r: 0, resource: 'wool', number: 10 },
    { id: 11, q: 2, r: 0, resource: 'ore', number: 5 },
    { id: 12, q: -2, r: 1, resource: 'wool', number: 9 },
    { id: 13, q: -1, r: 1, resource: 'wood', number: 12 },
    { id: 14, q: 0, r: 1, resource: 'brick', number: 6 },
    { id: 15, q: 1, r: 1, resource: 'wool', number: 4 },
    { id: 16, q: -2, r: 2, resource: 'grain', number: 8 },
    { id: 17, q: -1, r: 2, resource: 'ore', number: 11 },
    { id: 18, q: 0, r: 2, resource: 'wood', number: 3 },
  ];
  return hexes;
};

const generateBoard = () => {
  const hexes: Hex[] = [];
  const resources: ResourceType[] = ([
    'wood', 'wood', 'wood', 'wood',
    'brick', 'brick', 'brick',
    'wool', 'wool', 'wool', 'wool',
    'grain', 'grain', 'grain', 'grain',
    'ore', 'ore', 'ore',
    'desert'
  ] as ResourceType[]).sort(() => Math.random() - 0.5);

  const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12].sort(() => Math.random() - 0.5);
  let numIdx = 0;

  const layout = [
    { q: 0, r: -2, count: 3 },
    { q: -1, r: -1, count: 4 },
    { q: -2, r: 0, count: 5 },
    { q: -2, r: 1, count: 4 },
    { q: -2, r: 2, count: 3 },
  ];

  let id = 0;
  layout.forEach((row) => {
    for (let i = 0; i < row.count; i++) {
      const res = resources[id];
      hexes.push({
        id,
        q: row.q + i,
        r: row.r,
        resource: res,
        number: res === 'desert' ? 0 : numbers[numIdx++],
      });
      id++;
    }
  });

  return hexes;
};

// Simplified vertex/edge mapping for MVP
// In a real Catan implementation, this would be a complex graph.
// For this MVP, we'll use a simplified coordinate-based approach.
const getHexVertices = (q: number, r: number) => {
  // Each hex has 6 vertices. We'll identify them by (q, r, index)
  // and normalize them so shared vertices have the same ID.
  return [0, 1, 2, 3, 4, 5].map(i => {
    // This is a placeholder for actual vertex normalization logic
    // For MVP, we'll use a simpler mapping or just pre-generate them.
    return `${q},${r},${i}`;
  });
};

// --- Main Component ---

export const CatanGame = ({ onUpdate, onMove, onEnd }: { onUpdate: (s: number) => void, onMove: () => void, onEnd: (s: number, m: number, v: boolean, q: number) => void }) => {
  // Game State
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialActionCompleted, setTutorialActionCompleted] = useState(false);
  const [activeAction, setActiveAction] = useState<'road' | 'settlement' | 'city' | null>(null);
  const [hoveredHex, setHoveredHex] = useState<number | null>(null);

  const [hexes, setHexes] = useState<Hex[]>(generateBoard());
  const [playerResources, setPlayerResources] = useState<ResourceSet>({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
  const [bot1Resources, setBot1Resources] = useState<ResourceSet>({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
  const [bot2Resources, setBot2Resources] = useState<ResourceSet>({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
  
  const [playerVP, setPlayerVP] = useState(2);
  const [bot1VP, setBot1VP] = useState(2);
  const [bot2VP, setBot2VP] = useState(2);

  const [robberHexId, setRobberHexId] = useState(hexes.find(h => h.resource === 'desert')?.id || 0);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [gameState, setGameState] = useState<'rolling' | 'playing' | 'robber' | 'bot_turn' | 'victory'>('rolling');
  const [winner, setWinner] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'bot1' | 'bot2'>('player');
  const [log, setLog] = useState<string[]>(['Игра началась!']);
  const [showTrade, setShowTrade] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);
  const nextFloatingId = useRef(0);

  const isTutorial = gameMode === 'tutorial';
  const currentTutorialStep = isTutorial ? TUTORIAL_STEPS[tutorialStep - 1] : null;

  const boardBounds = useMemo(() => {
    const size = 40;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    hexes.forEach(hex => {
      const x = size * (3/2 * hex.q) + 150;
      const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r) + 150;
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * (Math.PI / 180);
        const cx = x + size * Math.cos(angle);
        const cy = y + size * Math.sin(angle);
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
      }
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 24;

    return {
      viewBox: `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`,
      centerX: minX + width / 2,
      centerY: minY + height / 2
    };
  }, [hexes]);

  const addFloatingText = (text: string, x: number, y: number, color: string = 'text-emerald-500') => {
    const id = nextFloatingId.current++;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  // Simplified building state for MVP
  // Instead of a full graph, we'll track buildings by hex and position
  const [buildings, setBuildings] = useState<{hexId: number, pos: number, type: 'settlement' | 'city', owner: string}[]>([
    { hexId: 7, pos: 0, type: 'settlement', owner: 'player' },
    { hexId: 11, pos: 3, type: 'settlement', owner: 'player' },
    { hexId: 2, pos: 0, type: 'settlement', owner: 'bot1' },
    { hexId: 5, pos: 3, type: 'settlement', owner: 'bot1' },
    { hexId: 15, pos: 0, type: 'settlement', owner: 'bot2' },
    { hexId: 18, pos: 3, type: 'settlement', owner: 'bot2' },
  ]);

  const [roads, setRoads] = useState<{hexId: number, edge: number, owner: string}[]>([
    { hexId: 7, edge: 0, owner: 'player' },
    { hexId: 11, edge: 3, owner: 'player' },
  ]);

  const [selectedTradeTarget, setSelectedTradeTarget] = useState<ResourceType | null>(null);

  const WIN_POINTS = 10;

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const startNormalGame = () => {
    setHexes(generateBoard());
    setShowStartScreen(false);
    setGameMode('normal');
    setGameState('rolling');
    setCurrentPlayer('player');
    setTurn(1);
    setPlayerVP(2);
    setBot1VP(2);
    setBot2VP(2);
    setPlayerResources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBot1Resources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBot2Resources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBuildings([
      { hexId: 7, pos: 0, type: 'settlement', owner: 'player' },
      { hexId: 11, pos: 3, type: 'settlement', owner: 'player' },
      { hexId: 2, pos: 0, type: 'settlement', owner: 'bot1' },
      { hexId: 5, pos: 3, type: 'settlement', owner: 'bot1' },
      { hexId: 15, pos: 0, type: 'settlement', owner: 'bot2' },
      { hexId: 18, pos: 3, type: 'settlement', owner: 'bot2' },
    ]);
    setRoads([
      { hexId: 7, edge: 0, owner: 'player' },
      { hexId: 11, edge: 3, owner: 'player' },
    ]);
    setLog(['Игра началась! Удачи.']);
    setActiveAction(null);
    setShowTrade(false);
    setShowHelp(false);
  };

  const startTutorial = () => {
    setHexes(generateTutorialBoard());
    setShowStartScreen(false);
    setGameMode('tutorial');
    setTutorialStep(1);
    setTutorialActionCompleted(false);
    setGameState('rolling');
    setCurrentPlayer('player');
    setTurn(1);
    setPlayerVP(2);
    setBot1VP(2);
    setBot2VP(2);
    setPlayerResources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBot1Resources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBot2Resources({ wood: 2, brick: 2, wool: 1, grain: 1, ore: 0 });
    setBuildings([
      { hexId: 7, pos: 0, type: 'settlement', owner: 'player' },
      { hexId: 11, pos: 3, type: 'settlement', owner: 'player' },
      { hexId: 2, pos: 0, type: 'settlement', owner: 'bot1' },
      { hexId: 5, pos: 3, type: 'settlement', owner: 'bot1' },
      { hexId: 15, pos: 0, type: 'settlement', owner: 'bot2' },
      { hexId: 18, pos: 3, type: 'settlement', owner: 'bot2' },
    ]);
    setRoads([
      { hexId: 7, edge: 0, owner: 'player' },
      { hexId: 11, edge: 3, owner: 'player' },
    ]);
    setLog(['Режим обучения активирован']);
    setActiveAction(null);
    setShowTrade(false);
    setShowHelp(false);
  };

  const rollDice = () => {
    if (gameState !== 'rolling') return;
    
    // Tutorial restriction
    if (isTutorial) {
      if (currentTutorialStep?.allowedActions && !currentTutorialStep.allowedActions.includes('roll')) {
        addLog('Следуйте инструкциям обучения!');
        return;
      }
    }
    
    // Tutorial Scripted Dice
    let d1, d2;
    if (isTutorial && tutorialStep === 2) {
      d1 = 3; d2 = 3; // 6
    } else {
      d1 = Math.floor(Math.random() * 6) + 1;
      d2 = Math.floor(Math.random() * 6) + 1;
    }

    // Tension delay
    setGameState('rolling'); 
    
    setTimeout(() => {
      const total = d1 + d2;
      setDice([d1, d2]);
      addLog(`Выпало: ${total}`);
      onMove();

      if (total === 7) {
        addLog('Выпало 7! Разбойник активирован.');
        setGameState('robber');
      } else {
        distributeResources(total);
        addFloatingText(`Выпало ${total}`, boardBounds.centerX, boardBounds.centerY, 'text-slate-900 font-black');
        setGameState('playing');
      }

      if (isTutorial && tutorialStep === 2) {
        setTutorialActionCompleted(true);
      }
    }, 400); 
  };

  const distributeResources = (roll: number) => {
    const players = ['player', 'bot1', 'bot2'];
    const gains: Record<string, Partial<ResourceSet>> = { player: {}, bot1: {}, bot2: {} };

    hexes.forEach(hex => {
      if (hex.number === roll && hex.id !== robberHexId) {
        buildings.forEach(b => {
          // Check if building is adjacent to this hex
          // Simplified: for MVP, we'll assume b.hexId is the primary hex it's attached to
          // and it also touches neighbors. For now, just the primary hex.
          if (b.hexId === hex.id) {
            const amount = b.type === 'city' ? 2 : 1;
            const res = hex.resource;
            if (res !== 'desert') {
              gains[b.owner][res as keyof ResourceSet] = (gains[b.owner][res as keyof ResourceSet] || 0) + amount;
            }
          }
        });
      }
    });

    // Apply gains
    if (Object.keys(gains.player).length > 0) {
      setPlayerResources(prev => {
        const next = { ...prev };
        Object.entries(gains.player).forEach(([res, amt]) => {
          next[res as keyof ResourceSet] += amt!;
          // Add floating text for each resource gained
          addFloatingText(`+${amt} ${RESOURCE_CONFIG[res as ResourceType].label}`, boardBounds.centerX, boardBounds.centerY, 'text-emerald-500');
        });
        return next;
      });
      addLog(`Вы получили ресурсы за ${roll}`);
    }

    setBot1Resources(prev => {
      const next = { ...prev };
      Object.entries(gains.bot1).forEach(([res, amt]) => {
        next[res as keyof ResourceSet] += amt!;
      });
      return next;
    });

    setBot2Resources(prev => {
      const next = { ...prev };
      Object.entries(gains.bot2).forEach(([res, amt]) => {
        next[res as keyof ResourceSet] += amt!;
      });
      return next;
    });
  };

  const handleHexClick = (hexId: number) => {
    if (gameState === 'robber') {
      setRobberHexId(hexId);
      addLog('Разбойник перемещен.');
      setGameState('playing');
    }
  };

  const buildSettlement = (hexId: number, pos: number) => {
    if (gameState !== 'playing' || currentPlayer !== 'player') return;
    
    // Tutorial restriction
    if (isTutorial) {
      if (currentTutorialStep?.allowedActions && !currentTutorialStep.allowedActions.includes('build_settlement')) {
        addLog('Следуйте инструкциям обучения!');
        return;
      }
      
      if (tutorialStep === 7) {
        // Only allow specific spot in tutorial
        if (hexId !== 7 || pos !== 1) {
          addLog('Постройте поселение в подсвеченном месте!');
          return;
        }
      }
    }
    
    // Check resources
    if (playerResources.wood < 1 || playerResources.brick < 1 || playerResources.wool < 1 || playerResources.grain < 1) {
      addLog('Недостаточно ресурсов для поселения');
      return;
    }

    // Check if spot is taken
    if (buildings.some(b => b.hexId === hexId && b.pos === pos)) {
      addLog('Место уже занято');
      return;
    }

    setPlayerResources(prev => ({
      ...prev,
      wood: prev.wood - 1,
      brick: prev.brick - 1,
      wool: prev.wool - 1,
      grain: prev.grain - 1,
    }));

    setBuildings(prev => [...prev, { hexId, pos, type: 'settlement', owner: 'player' }]);
    addFloatingText('+1 Очко!', boardBounds.centerX, boardBounds.centerY - 50, 'text-amber-500 font-black');
    
    setPlayerVP(v => {
      const newVP = v + 1;
      if (newVP >= 10) {
        setWinner('player');
        setGameState('victory');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#fbbf24', '#10b981']
        });
      }
      return newVP;
    });
    addLog('Поселение построено! (+1 VP)');
    onUpdate((playerVP + 1) * 100);
    onMove();
    setActiveAction(null);

    if (isTutorial && tutorialStep === 7) {
      setTutorialActionCompleted(true);
    }
  };

  const upgradeToCity = (hexId: number, pos: number) => {
    if (gameState !== 'playing' || currentPlayer !== 'player') return;
    if (isTutorial) return;

    const building = buildings.find(b => b.hexId === hexId && b.pos === pos && b.owner === 'player' && b.type === 'settlement');
    if (!building) return;

    if (playerResources.grain < 2 || playerResources.ore < 3) {
      addLog('Недостаточно ресурсов для города');
      return;
    }

    setPlayerResources(prev => ({
      ...prev,
      grain: prev.grain - 2,
      ore: prev.ore - 3,
    }));

    setBuildings(prev => prev.map(b => (b.hexId === hexId && b.pos === pos) ? { ...b, type: 'city' } : b));
    addFloatingText('+1 Очко!', boardBounds.centerX, boardBounds.centerY - 50, 'text-amber-500 font-black');

    setPlayerVP(v => {
      const newVP = v + 1;
      if (newVP >= 10) {
        setWinner('player');
        setGameState('victory');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#fbbf24', '#10b981']
        });
      }
      return newVP;
    });
    addLog('Город построен! (+1 VP)');
    onUpdate((playerVP + 1) * 100);
    onMove();
    setActiveAction(null);
  };

  const buildRoad = (hexId: number, edge: number) => {
    if (gameState !== 'playing' || currentPlayer !== 'player') return;
    
    if (isTutorial) {
      if (currentTutorialStep?.allowedActions && !currentTutorialStep.allowedActions.includes('build_road')) {
        addLog('Следуйте инструкциям обучения!');
        return;
      }

      if (tutorialStep === 5) {
        // Only allow specific spot in tutorial
        if (hexId !== 7 || edge !== 1) {
          addLog('Постройте дорогу в подсвеченном месте!');
          return;
        }
      }
    }

    if (playerResources.wood < 1 || playerResources.brick < 1) {
      addLog('Недостаточно ресурсов для дороги');
      return;
    }

    if (roads.some(r => r.hexId === hexId && r.edge === edge)) {
      addLog('Дорога уже построена');
      return;
    }

    setPlayerResources(prev => ({
      ...prev,
      wood: prev.wood - 1,
      brick: prev.brick - 1,
    }));

    setRoads(prev => [...prev, { hexId, edge, owner: 'player' }]);
    addFloatingText('+Путь', boardBounds.centerX, boardBounds.centerY, 'text-blue-500');
    addLog('Дорога построена');
    onMove();
    setActiveAction(null);

    if (isTutorial && tutorialStep === 5) {
      setTutorialActionCompleted(true);
    }
  };

  const endTurn = () => {
    if (playerVP >= WIN_POINTS) {
      onEnd(playerVP * 100, turn, true, 1.0);
      return;
    }

    if (isTutorial) {
      if (currentTutorialStep?.allowedActions && !currentTutorialStep.allowedActions.includes('end_turn')) {
        addLog('Следуйте инструкциям обучения!');
        return;
      }

      if (tutorialStep === 9) {
        setTutorialActionCompleted(true);
        // Give bonus resources to ensure victory
        setPlayerResources(prev => ({
          wood: prev.wood + 10,
          brick: prev.brick + 10,
          wool: prev.wool + 10,
          grain: prev.grain + 10,
          ore: prev.ore + 10
        }));
        addLog('Вы получили ресурсы для финального рывка!');
      }
    }

    setCurrentPlayer('bot1');
    setGameState('bot_turn');
    onMove();
  };

  useEffect(() => {
    if (isTutorial && tutorialStep === 12) {
      setGameMode('normal');
      setTutorialStep(0);
      setTutorialActionCompleted(false);
      addLog('Обучение завершено! Теперь играйте сами.');
    }
  }, [tutorialStep, isTutorial]);

  // --- Bot AI ---

  useEffect(() => {
    if (gameState === 'bot_turn') {
      const botId = currentPlayer === 'bot1' ? 'bot1' : 'bot2';
      const setRes = currentPlayer === 'bot1' ? setBot1Resources : setBot2Resources;
      const res = currentPlayer === 'bot1' ? bot1Resources : bot2Resources;
      const vp = currentPlayer === 'bot1' ? bot1VP : bot2VP;
      const setVP = currentPlayer === 'bot1' ? setBot1VP : setBot2VP;

      const timer = setTimeout(() => {
        // 1. Roll
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        setDice([d1, d2]);

        if (total === 7) {
          // Move robber randomly
          setRobberHexId(Math.floor(Math.random() * hexes.length));
          addLog(`${botId === 'bot1' ? 'Бот 1' : 'Бот 2'} переместил разбойника`);
        } else {
          distributeResources(total);
          addFloatingText(`Выпало ${total}`, boardBounds.centerX, boardBounds.centerY, 'text-slate-900 font-black');
        }

        // 2. Simple Logic
        let currentRes = { ...res };
        let currentVP = vp;

        // Try build settlement
        if (currentRes.wood >= 1 && currentRes.brick >= 1 && currentRes.wool >= 1 && currentRes.grain >= 1) {
          currentRes = { ...currentRes, wood: currentRes.wood - 1, brick: currentRes.brick - 1, wool: currentRes.wool - 1, grain: currentRes.grain - 1 };
          currentVP += 1;
          addLog(`${botId === 'bot1' ? 'Бот 1' : 'Бот 2'} построил поселение`);
          
          if (currentVP >= 10) {
          setWinner(botId);
          setGameState('victory');
        } else if (currentVP > playerVP) {
          addLog(`Внимание! ${botId === 'bot1' ? 'Бот 1' : 'Бот 2'} обгоняет вас!`);
        }
      } 
      // Try upgrade to city
      else if (currentRes.grain >= 2 && currentRes.ore >= 3) {
        currentRes = { ...currentRes, grain: currentRes.grain - 2, ore: currentRes.ore - 3 };
        currentVP += 1;
        addLog(`${botId === 'bot1' ? 'Бот 1' : 'Бот 2'} построил город`);
        if (currentVP >= 10) {
          setWinner(botId);
          setGameState('victory');
        }
      }

      setRes(currentRes);
      setVP(currentVP);

      // 3. Next Turn
      if (currentVP >= WIN_POINTS) {
        onEnd(playerVP * 100, turn, false, 0.5);
        return;
      }

      if (currentPlayer === 'bot1') {
        setCurrentPlayer('bot2');
      } else {
        setCurrentPlayer('player');
        setGameState('rolling');
        setTurn(t => t + 1);
        if (playerVP >= 8) {
          addLog('🔥 Ваш решающий ход! До победы совсем чуть-чуть!');
        }
      }
    }, 800);

      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayer]);

  // --- Render Helpers ---

  const renderHex = (hex: Hex) => {
    const config = RESOURCE_CONFIG[hex.resource];
    const isRobber = robberHexId === hex.id;

    // Axial to Pixel
    const size = 40;
    const x = size * (3/2 * hex.q) + 150;
    const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r) + 150;

    return (
      <g 
        key={hex.id} 
        transform={`translate(${x}, ${y})`} 
        onClick={() => handleHexClick(hex.id)}
        onMouseEnter={() => setHoveredHex(hex.id)}
        onMouseLeave={() => setHoveredHex(null)}
      >
        <polygon
          points="40,0 20,34.6 -20,34.6 -40,0 -20,-34.6 20,-34.6"
          className={`${config.color} stroke-white/30 stroke-1 cursor-pointer transition-all hover:brightness-110 ${activeAction ? 'opacity-40' : 'opacity-100'}`}
        />
        
        {/* Resource Icon on Hex */}
        <g transform="translate(0, -12)" className="pointer-events-none opacity-60">
          {React.cloneElement(config.icon as React.ReactElement, { className: 'w-7 h-7 text-white drop-shadow-md' })}
        </g>

        {hex.resource !== 'desert' && (
          <circle r="12" fill="white" fillOpacity="0.9" className="shadow-sm" />
        )}
        <text
          textAnchor="middle"
          dy=".3em"
          className={`text-[12px] font-black pointer-events-none ${hex.number === 6 || hex.number === 8 ? 'fill-red-600' : 'fill-slate-800'}`}
        >
          {hex.number > 0 ? hex.number : ''}
        </text>
        {isRobber && (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <circle r="14" className="fill-slate-900/40 stroke-white stroke-1" />
            <ShieldAlert className="w-5 h-5 text-white -translate-x-2.5 -translate-y-2.5" />
          </motion.g>
        )}
        
        {/* Roads & Edge Interaction */}
        {[0, 1, 2, 3, 4, 5].map(edge => {
          const r = roads.find(r => r.hexId === hex.id && r.edge === edge);
          let isHighlight = activeAction === 'road' && !r;
          let showCallout = false;
          
          // Tutorial specific highlight
          if (isTutorial) {
            if (currentTutorialStep?.targetType === 'edge' && currentTutorialStep.targetId === `${hex.id}-${edge}`) {
              isHighlight = true;
              showCallout = true;
            } else if (activeAction === 'road') {
              // In tutorial, only highlight the target edge
              isHighlight = false;
            }
          }

          // Edge positioning
          const angle = (edge * 60 - 30) * (Math.PI / 180);
          const rx = Math.cos(angle) * 34.6;
          const ry = Math.sin(angle) * 34.6;
          
          return (
            <g key={`edge-${edge}`} onClick={(e) => {
              e.stopPropagation();
              if (activeAction === 'road') buildRoad(hex.id, edge);
            }}>
              {/* Invisible wider line for easier clicking */}
              <line
                x1={0} y1={0}
                x2={rx} y2={ry}
                stroke="transparent"
                strokeWidth="15"
                className="cursor-pointer"
              />
              {r && (
                <line
                  x1={0} y1={0}
                  x2={rx} y2={ry}
                  stroke={r.owner === 'player' ? '#2563eb' : '#94a3b8'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              )}
              {isHighlight && (
                <line
                  x1={0} y1={0}
                  x2={rx} y2={ry}
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="4 2"
                  className="animate-pulse cursor-pointer"
                />
              )}
              {showCallout && currentTutorialStep?.benefit && (
                <g transform={`translate(${rx/2}, ${ry/2})`}>
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <path d="M0,0 L10,-10 L40,-10 L40,-25 L-40,-25 L-40,-10 L-10,-10 Z" fill="#2563eb" className="shadow-lg" />
                    <text y="-15" textAnchor="middle" className="fill-white text-[5px] font-black uppercase">{currentTutorialStep.benefit}</text>
                  </motion.g>
                </g>
              )}
            </g>
          );
        })}

        {/* Simplified Building Spots (Vertices) */}
        {[0, 1, 2, 3, 4, 5].map(pos => {
          const b = buildings.find(b => b.hexId === hex.id && b.pos === pos);
          let isHighlight = (activeAction === 'settlement' && !b) || (activeAction === 'city' && b?.owner === 'player' && b?.type === 'settlement');
          let showCallout = false;
          
          // Tutorial specific highlight
          if (isTutorial) {
            if (currentTutorialStep?.targetType === 'vertex' && currentTutorialStep.targetId === `${hex.id}-${pos}`) {
              isHighlight = true;
              showCallout = true;
            } else if (activeAction === 'settlement' || activeAction === 'city') {
              // In tutorial, only highlight the target vertex
              isHighlight = false;
            }
          }

          const angle = (pos * 60 - 90) * (Math.PI / 180);
          const vx = Math.cos(angle) * 40;
          const vy = Math.sin(angle) * 40;
          
          return (
            <g key={pos} transform={`translate(${vx}, ${vy})`} onClick={(e) => {
              e.stopPropagation();
              if (activeAction === 'settlement' && !b) buildSettlement(hex.id, pos);
              else if (activeAction === 'city' && b?.owner === 'player' && b?.type === 'settlement') upgradeToCity(hex.id, pos);
            }}>
              <circle 
                r={isHighlight ? "8" : "5"} 
                className={`${b ? (b.owner === 'player' ? 'fill-blue-600' : 'fill-slate-400') : (isHighlight ? 'fill-emerald-500 animate-pulse' : 'fill-white/20 hover:fill-white/50')} stroke-white stroke-1 cursor-pointer transition-all`} 
              />
              {b?.type === 'city' && <Building2 className="w-3 h-3 text-white -translate-x-1.5 -translate-y-1.5 pointer-events-none" />}
              {b?.type === 'settlement' && <Home className="w-3 h-3 text-white -translate-x-1.5 -translate-y-1.5 pointer-events-none" />}
              
              {showCallout && currentTutorialStep?.benefit && (
                <g transform="translate(0, -15)">
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <path d="M0,0 L5,-5 L25,-5 L25,-15 L-25,-15 L-25,-5 L-5,-5 Z" fill="#fbbf24" />
                    <text y="-8" textAnchor="middle" className="fill-slate-900 text-[5px] font-black uppercase">{currentTutorialStep.benefit}</text>
                  </motion.g>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] font-sans relative overflow-hidden max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Start Screen */}
      <AnimatePresence>
        {showStartScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                <Hexagon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Catan</h1>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Постройте свою империю на острове Катан. Собирайте ресурсы и станьте величайшим правителем.
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={startTutorial}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Trophy className="w-5 h-5" />
                  Обучение (Рекомендуется)
                </button>
                <button 
                  onClick={startNormalGame}
                  className="w-full py-4 bg-white border-2 border-slate-100 hover:border-blue-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  Обычная игра
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Screen */}
      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-[100] ${winner === 'player' ? 'bg-blue-600/95' : 'bg-slate-900/95'} flex flex-col items-center justify-center p-6 text-center text-white`}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="mb-8"
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                {winner === 'player' ? (
                  <Trophy className="w-16 h-16 text-blue-600" />
                ) : (
                  <ShieldAlert className="w-16 h-16 text-slate-900" />
                )}
              </div>
              <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">
                {isTutorial ? '🎉 Первая победа!' : (winner === 'player' ? '🎉 Победа!' : 'Почти получилось!')}
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                {isTutorial 
                  ? 'Вы освоили основы! Теперь попробуйте победить без подсказок.'
                  : (winner === 'player' 
                    ? 'Вы — величайший правитель Катана! Вырвались из крысиных бегов!' 
                    : `Бот был чуть быстрее в этот раз. Вы были всего в ${10 - playerVP} шагах от триумфа!`)}
              </p>
            </motion.div>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {isTutorial ? 'Играть самому' : 'Играть снова'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isTutorial && gameState !== 'victory' && (
        <TutorialOverlay 
          step={tutorialStep} 
          canProceed={tutorialActionCompleted}
          onNext={() => {
            setTutorialStep(prev => prev + 1);
            setTutorialActionCompleted(false);
          }} 
          onSkip={() => setGameMode('normal')} 
        />
      )}

      {/* Top Bar: VP & Status - Compact */}
      <div className="px-3 pt-3 pb-1 z-10">
        <div className={`bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border flex items-center justify-between transition-all duration-500 ${playerVP >= 8 ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-100' : 'border-slate-100'}`}>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
            <VPBadge label="Вы" points={playerVP} active={currentPlayer === 'player'} isClose={playerVP >= 8} />
            <VPBadge label="Б1" points={bot1VP} active={currentPlayer === 'bot1'} />
            <VPBadge label="Б2" points={bot2VP} active={currentPlayer === 'bot2'} />
          </div>
          <div className="flex items-center gap-2 px-2 border-l border-slate-100 ml-2">
            <Dice6 className="w-3 h-3 text-blue-600" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Ход {turn}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 px-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Прогресс до победы</span>
            <span className="text-[8px] font-black text-blue-600">{playerVP}/10</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(playerVP / 10) * 100}%` }}
              className={`h-full rounded-full transition-all duration-1000 ${playerVP >= 8 ? 'bg-gradient-to-r from-blue-600 to-amber-400' : 'bg-blue-600'}`}
            />
          </div>
        </div>
      </div>

      {/* Game Board - Maximized */}
      <div className={`flex-1 relative overflow-hidden flex items-center justify-center transition-all ${activeAction ? 'bg-blue-50/30' : 'bg-sky-50/30'}`}>
        <svg viewBox={boardBounds.viewBox} className="w-full h-full max-h-[75vh] p-2">
          {hexes.map(renderHex)}
        </svg>

        {/* Dice Overlay - Small & Non-intrusive */}
        <div className="absolute top-2 right-3 flex gap-1 z-10 opacity-80 scale-75 origin-top-right">
          <Die value={dice[0]} />
          <Die value={dice[1]} />
        </div>

        {/* Hex Info Tooltip - Minimal */}
        <AnimatePresence>
          {hoveredHex !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-2 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-slate-100 flex items-center gap-1.5 z-20"
            >
              <div className={`${RESOURCE_CONFIG[hexes.find(h => h.id === hoveredHex)!.resource as ResourceType].color} w-3 h-3 rounded-sm`} />
              <span className="text-[9px] font-black text-slate-900">{hexes.find(h => h.id === hoveredHex)!.number || '7'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Log - Very Minimal */}
        <div className="absolute bottom-2 left-3 right-3 pointer-events-none z-10 flex flex-col gap-1">
          {log.slice(0, 2).map((msg, i) => (
            <motion.div
              key={i + msg}
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`text-[7px] px-2 py-0.5 rounded-full w-fit ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white/60 text-slate-500'}`}
            >
              {msg}
            </motion.div>
          ))}
        </div>

        {/* Active Action Hint */}
        {activeAction && (
          <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">
              Выберите место
            </div>
          </div>
        )}

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: t.y, x: t.x }}
              animate={{ opacity: 1, y: t.y - 50 }}
              exit={{ opacity: 0 }}
              className={`absolute pointer-events-none z-[100] text-xs font-black ${t.color} drop-shadow-sm`}
              style={{ left: t.x, top: t.y }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Resources Panel - Compact Row */}
      <div className={`px-3 py-1.5 bg-white border-t border-slate-100 z-10 flex justify-between items-center ${isTutorial && tutorialStep === 3 ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-0.5">
          {Object.entries(playerResources).map(([res, count]) => (
            <motion.div 
              key={`${res}-${count}`}
              className="flex items-center gap-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${RESOURCE_CONFIG[res as ResourceType].color} w-3.5 h-3.5 rounded-md flex items-center justify-center text-white shadow-sm`}>
                {React.cloneElement(RESOURCE_CONFIG[res as ResourceType].icon as React.ReactElement, { className: 'w-2 h-2' })}
              </div>
              <span className="text-[10px] font-black text-slate-700">{count}</span>
            </motion.div>
          ))}
        </div>
        <button onClick={() => setShowHelp(true)} className="text-slate-400 p-1">
          <Info className="w-4 h-4" />
        </button>
      </div>

        {/* Action Bar - Bottom & Compact */}
        <div className="px-3 pb-6 pt-2 bg-white z-10 grid grid-cols-5 gap-2">
          {gameState === 'rolling' && currentPlayer === 'player' ? (
            <div className="col-span-4 relative">
              <Button 
                onClick={rollDice} 
                className={`w-full rounded-xl py-3 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-[10px] font-black uppercase tracking-widest transition-all ${isTutorial && tutorialStep === 2 ? 'ring-4 ring-blue-400 animate-pulse' : ''} ${gameState === 'rolling' ? 'animate-shake' : ''}`}
              >
                <Dice6 className="w-4 h-4 mr-2" /> Бросить кубики
              </Button>
              {isTutorial && tutorialStep === 2 && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-bold whitespace-nowrap shadow-xl animate-bounce">
                  Нажмите сюда ↑
                </div>
              )}
            </div>
          ) : (
            <>
              <ActionButton 
                icon={<ArrowRight className="w-3.5 h-3.5 rotate-45" />} 
                label="Дорога" 
                active={playerResources.wood >= 1 && playerResources.brick >= 1}
                selected={activeAction === 'road'}
                onClick={() => {
                  if (isTutorial && tutorialStep !== 4) {
                    addLog('Сейчас нужно выбрать дорогу!');
                    return;
                  }
                  setActiveAction(activeAction === 'road' ? null : 'road');
                  if (isTutorial && tutorialStep === 4) setTutorialActionCompleted(true);
                }}
                highlight={isTutorial && tutorialStep === 4}
                hint={isTutorial && tutorialStep === 4 ? "Стройте путь" : ""}
                benefit="+Путь"
              />
              <ActionButton 
                icon={<Home className="w-3.5 h-3.5" />} 
                label="Дом" 
                active={playerResources.wood >= 1 && playerResources.brick >= 1 && playerResources.wool >= 1 && playerResources.grain >= 1}
                selected={activeAction === 'settlement'}
                onClick={() => {
                  if (isTutorial && tutorialStep !== 6) {
                    addLog('Сейчас нужно выбрать поселение!');
                    return;
                  }
                  setActiveAction(activeAction === 'settlement' ? null : 'settlement');
                  if (isTutorial && tutorialStep === 6) setTutorialActionCompleted(true);
                }}
                highlight={isTutorial && tutorialStep === 6}
                hint={isTutorial && tutorialStep === 6 ? "Выберите дом" : ""}
                benefit="+1 Очко"
              />
              <ActionButton 
                icon={<Building2 className="w-3.5 h-3.5" />} 
                label="Город" 
                active={playerResources.grain >= 2 && playerResources.ore >= 3}
                selected={activeAction === 'city'}
                onClick={() => setActiveAction(activeAction === 'city' ? null : 'city')}
                benefit="+2 Очка"
              />
              <ActionButton 
                icon={<RefreshCw className="w-3.5 h-3.5" />} 
                label="Обмен" 
                active={Object.values(playerResources).some(v => (v as number) >= 4)}
                onClick={() => setShowTrade(true)}
                benefit="4 к 1"
              />
            </>
          )}
          <Button 
            variant="secondary" 
            onClick={endTurn}
            disabled={(gameState !== 'playing' && gameState !== 'rolling') || currentPlayer !== 'player'}
            className={`rounded-xl py-3 h-auto text-[9px] font-black uppercase transition-all active:scale-95 ${gameState === 'playing' && currentPlayer === 'player' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'} ${isTutorial && tutorialStep === 8 ? 'ring-2 ring-blue-500 animate-pulse' : ''} ${gameState === 'rolling' && currentPlayer === 'player' ? 'col-span-1' : ''}`}
          >
            {gameState === 'rolling' && currentPlayer === 'player' ? '...' : 'Конец'}
          </Button>
        </div>

      {/* Smart Hint - Compact */}
      <SmartHint 
        resources={playerResources} 
        gameState={gameState} 
        currentPlayer={currentPlayer} 
        isTutorial={isTutorial}
        playerVP={playerVP}
      />

      {/* Modals */}
      <AnimatePresence>
        {showTrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase">Торговля (4:1)</h3>
                <X className="w-6 h-6 text-slate-400 cursor-pointer" onClick={() => setShowTrade(false)} />
              </div>
              
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Что отдаем (4 шт):</p>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(playerResources).map(([res, count]) => (
                    <button 
                      key={res} 
                      disabled={(count as number) < 4}
                      onClick={() => {
                        // For simplicity, we'll just use a state to track what we give
                        // and then pick what we get.
                      }}
                      className={`p-2 rounded-xl border-2 ${(count as number) >= 4 ? 'border-blue-100 bg-blue-50' : 'border-slate-100 opacity-30 grayscale'}`}
                    >
                      {RESOURCE_CONFIG[res as ResourceType].icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Что получаем (1 шт):</p>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(RESOURCE_CONFIG).filter(r => r !== 'desert').map((res) => (
                    <button 
                      key={res} 
                      onClick={() => setSelectedTradeTarget(res as ResourceType)}
                      className={`p-2 rounded-xl border-2 ${selectedTradeTarget === res ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
                    >
                      {RESOURCE_CONFIG[res as ResourceType].icon}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                disabled={!selectedTradeTarget || !Object.entries(playerResources).some(([r, c]) => (c as number) >= 4)}
                className="w-full rounded-2xl py-4 bg-blue-600 hover:bg-blue-500"
                onClick={() => {
                  const giveRes = Object.entries(playerResources).find(([r, c]) => (c as number) >= 4)?.[0] as keyof ResourceSet;
                  if (giveRes && selectedTradeTarget) {
                    setPlayerResources(prev => ({
                      ...prev,
                      [giveRes]: prev[giveRes] - 4,
                      [selectedTradeTarget]: prev[selectedTradeTarget as keyof ResourceSet] + 1
                    }));
                    addLog('Обмен совершен');
                    setShowTrade(false);
                    setSelectedTradeTarget(null);
                  }
                }}
              >
                Подтвердить обмен
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Button */}
      <button 
        onClick={() => setShowHelp(true)}
        className="fixed bottom-24 right-6 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-blue-600 z-40"
      >
        <Info className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase">Как играть в Catan</h3>
                <X className="w-6 h-6 text-slate-400 cursor-pointer" onClick={() => setShowHelp(false)} />
              </div>
              <div className="space-y-4 text-sm text-slate-600">
                <p>🎯 <b>Цель:</b> Набрать 10 победных очков первым.</p>
                <p>🎲 <b>Ход:</b> Бросайте кубики. Гексы с выпавшим числом приносят ресурсы тем, у кого рядом есть поселения.</p>
                <p>🏠 <b>Поселение (1 VP):</b> Стройте на белых точках. Дает 1 ресурс. Стоит: 🌲🧱🐑🌾</p>
                <p>🏙️ <b>Город (2 VP):</b> Улучшайте поселение. Дает 2 ресурса. Стоит: 🌾🌾⛰️⛰️⛰️</p>
                <p>👹 <b>Разбойник:</b> При выпадении 7 вы можете заблокировать гекс соперника.</p>
                <p>🤝 <b>Торговля:</b> Обменивайте 4 лишних ресурса на 1 нужный в банке.</p>
              </div>
              <Button onClick={() => setShowHelp(false)} className="mt-6 rounded-2xl bg-blue-600 hover:bg-blue-500">Понятно!</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Subcomponents ---

const TutorialOverlay = ({ step, onNext, onSkip, canProceed }: { step: number, onNext: () => void, onSkip: () => void, canProceed: boolean }) => {
  const current = TUTORIAL_STEPS[step - 1] || TUTORIAL_STEPS[0];
  const [showHint, setShowHint] = useState(false);

  const handleNext = () => {
    const isReady = canProceed || current.type === 'info' || current.type === 'victory';
    if (isReady) {
      onNext();
      setShowHint(false);
    } else {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-28 z-[90] pointer-events-none">
      <motion.div 
        key={step}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto border-2 border-blue-500 max-w-sm mx-auto relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {step}
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Шаг {step} из {TUTORIAL_STEPS.length}</span>
          </div>
          <button onClick={onSkip} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">Пропустить</button>
        </div>
        
        <h3 className="text-base font-black text-slate-900 mb-2 leading-tight">{current.title}</h3>
        <p className="text-[11px] text-slate-600 mb-4 leading-relaxed font-medium">{current.text}</p>
        
        {current.reason && (
          <div className="bg-blue-50/50 rounded-2xl p-3 mb-4 border border-blue-100/50 flex gap-3">
            <div className="text-blue-500 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-blue-800 font-semibold leading-snug italic">
              {current.reason}
            </p>
          </div>
        )}

        <div className="relative pt-2">
          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute -top-12 left-0 right-0 bg-slate-900 text-white text-[10px] py-2 px-4 rounded-xl text-center font-bold shadow-xl z-10"
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                  Сначала выполните действие на поле!
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button 
            onClick={handleNext} 
            className={`w-full rounded-2xl py-3.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
              (canProceed || current.type === 'info' || current.type === 'victory') 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 text-white' 
                : 'bg-blue-600/40 text-white/70 cursor-not-allowed'
            }`}
          >
            {step === TUTORIAL_STEPS.length ? "Играть самому!" : "Продолжить"}
            <ArrowRight className={`w-4 h-4 transition-transform ${canProceed || current.type === 'info' || current.type === 'victory' ? 'translate-x-0' : 'opacity-50'}`} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const SmartHint = ({ resources, gameState, currentPlayer, isTutorial, playerVP }: any) => {
  if (isTutorial || currentPlayer !== 'player') return null;

  let hint = "";
  let isBest = false;
  
  if (gameState === 'rolling') hint = "Бросайте кубики";
  else if (playerVP >= 9) {
    hint = "🔥 Последний рывок! Постройте что-нибудь!";
    isBest = true;
  }
  else if (resources.wood >= 1 && resources.brick >= 1 && resources.wool >= 1 && resources.grain >= 1) {
    hint = "🔥 Лучший ход: Постройте дом";
    isBest = true;
  }
  else if (resources.grain >= 2 && resources.ore >= 3) {
    hint = "🔥 Лучший ход: Постройте город";
    isBest = true;
  }
  else if (resources.wood >= 1 && resources.brick >= 1) hint = "Можно построить дорогу";
  else if (gameState === 'playing') hint = "Соберите еще ресурсов";

  if (!hint) return null;

  return (
    <motion.div 
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg z-30 flex items-center gap-1.5 border ${isBest ? 'bg-amber-500 border-amber-300' : 'bg-slate-900/90 border-slate-700'}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isBest ? 'bg-white' : 'bg-blue-500'}`} />
      {hint}
    </motion.div>
  );
};

const VPBadge = ({ label, points, active, isClose }: any) => (
  <motion.div 
    animate={isClose && active ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
    transition={{ repeat: Infinity, duration: 2 }}
    className={`px-2 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
      active ? (isClose ? 'border-amber-500 bg-amber-50/50' : 'border-blue-500 bg-blue-50/50') : 
      'border-slate-100 bg-slate-50 opacity-40'
    }`}
  >
    <span className={`text-[7px] font-black uppercase ${active ? (isClose ? 'text-amber-600' : 'text-blue-600') : 'text-slate-400'}`}>{label}</span>
    <span className={`text-[10px] font-black ${active ? (isClose ? 'text-amber-700' : 'text-blue-600') : 'text-slate-600'}`}>{points}</span>
    {isClose && active && <Zap className="w-2 h-2 text-amber-500 animate-pulse" />}
  </motion.div>
);

const Die = ({ value }: { value: number }) => (
  <motion.div 
    key={value}
    initial={{ rotate: -360, scale: 0.2, opacity: 0 }}
    animate={{ rotate: 0, scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    className="w-10 h-10 bg-white rounded-xl shadow-xl border-2 border-slate-100 flex items-center justify-center relative overflow-hidden"
  >
    <motion.div 
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-blue-400"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-50" />
    <span className="text-lg font-black text-slate-900 relative z-10">{value}</span>
    
    {/* Dice dots for extra polish */}
    <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-slate-200" />
    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-slate-200" />
  </motion.div>
);

const ActionButton = ({ icon, label, active, selected, onClick, highlight, hint, benefit }: any) => (
  <div className="relative group flex-1">
    <button 
      onClick={active ? onClick : undefined}
      className={`w-full py-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
        highlight ? 'ring-4 ring-blue-400 animate-pulse' : ''
      } ${
        selected ? 'bg-blue-600 border-blue-400 text-white shadow-md' :
        active ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 
        'bg-slate-50 border-slate-100 text-slate-300 grayscale opacity-40'
      }`}
    >
      <div className={`${selected ? 'text-white' : active ? 'text-blue-600' : 'text-slate-300'} mb-0.5`}>
        {icon}
      </div>
      <span className="text-[6px] font-black uppercase tracking-tighter text-center px-0.5 leading-none mb-0.5">{label}</span>
      {benefit && active && (
        <span className={`text-[5px] font-bold uppercase opacity-60 ${selected ? 'text-white' : 'text-slate-400'}`}>{benefit}</span>
      )}
    </button>
    {hint && (
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-lg text-[7px] font-bold whitespace-nowrap shadow-lg animate-bounce z-50">
        {hint}
      </div>
    )}
  </div>
);
