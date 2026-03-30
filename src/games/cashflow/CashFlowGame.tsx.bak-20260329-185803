import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../../shared/components';
import { 
  Dice6, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  ArrowUpRight, 
  User, 
  Cpu,
  Target,
  Sparkles,
  Zap,
  ShieldAlert,
  Dices,
  Trophy,
  Flame,
  ArrowRight,
  Briefcase,
  Coins,
  Building2,
  Rocket,
  BarChart3,
  Gem,
  Crown,
  Star,
  ZapOff,
  TrendingDown,
  ShoppingBag,
  Car,
  Home,
  Laptop,
  Smartphone,
  Coffee,
  Plane,
  Gift,
  Construction,
  Hammer,
  Stethoscope,
  GraduationCap,
  Scale,
  Gavel,
  Banknote,
  Landmark,
  PiggyBank,
  CreditCard,
  Bitcoin,
  Globe,
  Network,
  PieChart,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Role {
  name: string;
  salary: number;
  expenses: number;
  startCash: number;
  icon: React.ReactNode;
}

const ROLES: Role[] = [
  { name: 'Офисный сотрудник', salary: 800, expenses: 600, startCash: 800, icon: <User className="w-5 h-5" /> },
  { name: 'Менеджер', salary: 1500, expenses: 1100, startCash: 1500, icon: <Briefcase className="w-5 h-5" /> },
  { name: 'Врач', salary: 2500, expenses: 1800, startCash: 2500, icon: <Stethoscope className="w-5 h-5" /> },
  { name: 'Предприниматель', salary: 3000, expenses: 2500, startCash: 3000, icon: <TrendingUp className="w-5 h-5" /> },
];

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'work' | 'expense' | 'deal' | 'risk' | 'high_stakes';
  rarity: 'common' | 'rare' | 'jackpot';
  cashChange?: number;
  incomeChange?: number;
  expenseChange?: number;
  cost?: number;
  riskOutcome?: {
    winChance: number;
    winCash: number;
    lossCash: number;
    winText?: string;
    lossText?: string;
  };
  icon: React.ReactNode;
  color: string;
  isHighStakesOnly?: boolean;
  isAutoApply?: boolean;
}

const EVENTS: GameEvent[] = [
  // --- WORK (Auto-apply) ---
  {
    id: 'work-salary',
    title: 'День зарплаты',
    description: 'Вы получили честно заработанные деньги.',
    type: 'work',
    rarity: 'common',
    isAutoApply: true,
    icon: <Wallet className="w-6 h-6" />,
    color: 'bg-emerald-500'
  },
  {
    id: 'work-bonus',
    title: 'Премия',
    description: 'Босс доволен вашими успехами!',
    type: 'work',
    rarity: 'common',
    cashChange: 500,
    isAutoApply: true,
    icon: <Sparkles className="w-6 h-6" />,
    color: 'bg-emerald-400'
  },
  {
    id: 'work-promotion',
    title: 'Повышение',
    description: 'Вас назначили на новую должность. Зарплата выросла!',
    type: 'work',
    rarity: 'rare',
    incomeChange: 200,
    isAutoApply: true,
    icon: <ArrowUpRight className="w-6 h-6" />,
    color: 'bg-emerald-600'
  },
  {
    id: 'work-side-hustle',
    title: 'Подработка',
    description: 'Выполнили проект на выходных.',
    type: 'work',
    rarity: 'common',
    cashChange: 300,
    isAutoApply: true,
    icon: <Laptop className="w-6 h-6" />,
    color: 'bg-emerald-300'
  },

  // --- EXPENSES (Now with choices) ---
  {
    id: 'exp-repair',
    title: 'Поломка авто',
    description: 'Двигатель начал стучать. Можно починить сейчас или надеяться, что пронесет.',
    type: 'expense',
    rarity: 'common',
    cost: 400,
    riskOutcome: { 
      winChance: 0.4, 
      winCash: 0, 
      lossCash: -1200,
      winText: 'Пронесло! Стук исчез сам собой.',
      lossText: 'Двигатель заклинило! Капитальный ремонт обошелся втридорога.'
    },
    icon: <Hammer className="w-6 h-6" />,
    color: 'bg-rose-500'
  },
  {
    id: 'exp-fine',
    title: 'Штраф ГИБДД',
    description: 'Превышение скорости. Оплатить штраф или попытаться оспорить?',
    type: 'expense',
    rarity: 'common',
    cost: 150,
    riskOutcome: { 
      winChance: 0.3, 
      winCash: 0, 
      lossCash: -450,
      winText: 'Суд встал на вашу сторону! Штраф аннулирован.',
      lossText: 'Апелляция отклонена. Пришлось платить штраф и судебные издержки.'
    },
    icon: <ShieldAlert className="w-6 h-6" />,
    color: 'bg-rose-600'
  },
  {
    id: 'exp-parking',
    title: 'Эвакуация',
    description: 'Машину увозит эвакуатор. Договориться на месте или ехать на штрафстоянку?',
    type: 'expense',
    rarity: 'common',
    cost: 200,
    riskOutcome: { 
      winChance: 0.5, 
      winCash: -50, 
      lossCash: -500,
      winText: 'Удалось договориться! Отделались легким испугом.',
      lossText: 'Договориться не вышло. Машина на стоянке, штраф максимальный.'
    },
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'bg-rose-700'
  },
  {
    id: 'exp-shopping',
    title: 'Распродажа',
    description: 'В любимом магазине скидки 70%. Купить новый гардероб или сдержаться?',
    type: 'expense',
    rarity: 'common',
    cost: 400,
    riskOutcome: { 
      winChance: 0.7, 
      winCash: 0, 
      lossCash: -100, // Emotional loss/stress? No, let's keep it simple.
      winText: 'Вы проявили железную волю и сохранили деньги!',
      lossText: 'Вы сорвались и купили "всего одну вещь", но дорогую.'
    },
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'bg-rose-400'
  },
  {
    id: 'exp-party',
    title: 'Вечеринка',
    description: 'Друзья зовут в дорогой клуб. Пойти или остаться дома?',
    type: 'expense',
    rarity: 'common',
    cost: 250,
    riskOutcome: { 
      winChance: 0.6, 
      winCash: 100, // Networking win
      lossCash: 0,
      winText: 'Отлично провели время и завели полезное знакомство!',
      lossText: 'Просто посидели дома. Сэкономили, но вечер был скучным.'
    },
    icon: <Coffee className="w-6 h-6" />,
    color: 'bg-rose-300'
  },
  {
    id: 'exp-dentist',
    title: 'Зубная боль',
    description: 'Нужно лечить кариес. Сделать сейчас или подождать?',
    type: 'expense',
    rarity: 'rare',
    cost: 600,
    riskOutcome: { 
      winChance: 0.2, 
      winCash: 0, 
      lossCash: -2000,
      winText: 'Боль прошла! Видимо, просто застряла косточка.',
      lossText: 'Пульпит! Срочная операция и протезирование.'
    },
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'bg-rose-800'
  },
  {
    id: 'exp-subscription',
    title: 'Подписка на сервис',
    description: 'Вы подписались на новый стриминг. Теперь это ежемесячный расход.',
    type: 'expense',
    rarity: 'common',
    expenseChange: 50,
    isAutoApply: true,
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-rose-300'
  },
  {
    id: 'exp-car-insurance',
    title: 'Страховка авто',
    description: 'Оформили расширенную страховку. Ежемесячный платеж вырос.',
    type: 'expense',
    rarity: 'common',
    expenseChange: 100,
    isAutoApply: true,
    icon: <ShieldAlert className="w-6 h-6" />,
    color: 'bg-rose-400'
  },

  // --- DEALS (INVESTMENTS) ---
  {
    id: 'deal-stocks-gazprom',
    title: 'Акции Газпром',
    description: 'Надежные дивидендные акции.',
    type: 'deal',
    rarity: 'common',
    cost: 500,
    incomeChange: 60,
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'deal-stocks-apple',
    title: 'Акции Apple',
    description: 'Технологический гигант всегда в цене.',
    type: 'deal',
    rarity: 'common',
    cost: 800,
    incomeChange: 100,
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-blue-400'
  },
  {
    id: 'deal-rental-garage',
    title: 'Гараж в аренду',
    description: 'Стабильный пассивный доход каждый месяц.',
    type: 'deal',
    rarity: 'common',
    cost: 1000,
    incomeChange: 150,
    icon: <Home className="w-6 h-6" />,
    color: 'bg-blue-600'
  },
  {
    id: 'deal-bonds',
    title: 'Облигации',
    description: 'Консервативный инструмент с низким риском.',
    type: 'deal',
    rarity: 'common',
    cost: 400,
    incomeChange: 40,
    icon: <PiggyBank className="w-6 h-6" />,
    color: 'bg-blue-300'
  },
  {
    id: 'deal-etf',
    title: 'ETF на индекс',
    description: 'Диверсифицированный портфель акций.',
    type: 'deal',
    rarity: 'common',
    cost: 1200,
    incomeChange: 180,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-700'
  },
  {
    id: 'deal-coffee-shop',
    title: 'Кофейня',
    description: 'Малый бизнес с хорошим потенциалом.',
    type: 'deal',
    rarity: 'rare',
    cost: 3000,
    incomeChange: 500,
    icon: <Coffee className="w-6 h-6" />,
    color: 'bg-blue-800'
  },
  {
    id: 'deal-real-estate',
    title: 'Квартира под сдачу',
    description: 'Серьезная инвестиция в недвижимость.',
    type: 'deal',
    rarity: 'rare',
    cost: 8000,
    incomeChange: 1200,
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-indigo-600'
  },

  // --- RISK ---
  {
    id: 'risk-crypto-small',
    title: 'Крипто-памп',
    description: 'Шанс сорвать куш на новом токене!',
    type: 'risk',
    rarity: 'common',
    cost: 400,
    riskOutcome: { 
      winChance: 0.4, 
      winCash: 1500, 
      lossCash: -400,
      winText: 'Токен улетел на луну! Вы вовремя зафиксировали прибыль.',
      lossText: 'Это был скам. Ваши вложения обнулились.'
    },
    icon: <Dices className="w-6 h-6" />,
    color: 'bg-purple-500'
  },
  {
    id: 'risk-startup-small',
    title: 'Стартап друга',
    description: 'Вложиться в идею "умного ошейника".',
    type: 'risk',
    rarity: 'common',
    cost: 800,
    riskOutcome: { 
      winChance: 0.3, 
      winCash: 3000, 
      lossCash: -800,
      winText: 'Ошейник стал хитом! Инвесторы выкупили вашу долю.',
      lossText: 'Идея провалилась. Собаки предпочитают обычные ошейники.'
    },
    icon: <Flame className="w-6 h-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'risk-bet',
    title: 'Ставка на спорт',
    description: 'Ваша любимая команда играет в финале.',
    type: 'risk',
    rarity: 'common',
    cost: 200,
    riskOutcome: { 
      winChance: 0.45, 
      winCash: 600, 
      lossCash: -200,
      winText: 'Победа на последних секундах! Букмекер выплачивает выигрыш.',
      lossText: 'Обидное поражение. Ставка не сыграла.'
    },
    icon: <Target className="w-6 h-6" />,
    color: 'bg-purple-400'
  },
  {
    id: 'risk-poker',
    title: 'Турнир по покеру',
    description: 'Проверьте свою удачу и блеф.',
    type: 'risk',
    rarity: 'rare',
    cost: 500,
    riskOutcome: { 
      winChance: 0.35, 
      winCash: 2500, 
      lossCash: -500,
      winText: 'Флеш-рояль! Вы забираете главный банк турнира.',
      lossText: 'Вас переблефовали. Вы выбываете из игры.'
    },
    icon: <Dices className="w-6 h-6" />,
    color: 'bg-purple-600'
  },

  // --- JACKPOT / UNIQUE (Auto-apply) ---
  {
    id: 'jackpot-inheritance',
    title: '💎 Наследство',
    description: 'Дальний родственник оставил вам состояние!',
    type: 'work',
    rarity: 'jackpot',
    cashChange: 5000,
    isAutoApply: true,
    icon: <Gem className="w-6 h-6" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'jackpot-lottery',
    title: '💎 Лотерея',
    description: 'Вы угадали все числа в билете!',
    type: 'work',
    rarity: 'jackpot',
    cashChange: 10000,
    isAutoApply: true,
    icon: <Trophy className="w-6 h-6" />,
    color: 'bg-yellow-600'
  },

  // --- HIGH STAKES ONLY ---
  {
    id: 'hs-crypto-whale',
    title: '🚀 Крипто-кит',
    description: 'Участие в закрытом пресейле крупного проекта.',
    type: 'high_stakes',
    rarity: 'rare',
    cost: 5000,
    riskOutcome: { 
      winChance: 0.3, 
      winCash: 25000, 
      lossCash: -5000,
      winText: 'Листинг на Binance! Цена взлетела до небес.',
      lossText: 'Проект оказался "пустышкой". Токены ничего не стоят.'
    },
    icon: <Bitcoin className="w-6 h-6" />,
    color: 'bg-purple-700',
    isHighStakesOnly: true
  },
  {
    id: 'hs-startup-unicorn',
    title: '🦄 Стартап-единорог',
    description: 'Инвестиция в будущий Uber или Airbnb.',
    type: 'high_stakes',
    rarity: 'rare',
    cost: 10000,
    riskOutcome: { 
      winChance: 0.2, 
      winCash: 80000, 
      lossCash: -10000,
      winText: 'Экзит! Крупная корпорация выкупила стартап.',
      lossText: 'Стартап не смог масштабироваться и закрылся.'
    },
    icon: <Rocket className="w-6 h-6" />,
    color: 'bg-orange-600',
    isHighStakesOnly: true
  },
  {
    id: 'hs-merger',
    title: '🤝 Слияние компаний',
    description: 'Спекуляция на инсайдерской информации о слиянии.',
    type: 'high_stakes',
    rarity: 'rare',
    cost: 7000,
    riskOutcome: { 
      winChance: 0.5, 
      winCash: 20000, 
      lossCash: -7000,
      winText: 'Слияние подтверждено! Акции взлетели на новостях.',
      lossText: 'Регулятор заблокировал сделку. Акции рухнули.'
    },
    icon: <Network className="w-6 h-6" />,
    color: 'bg-indigo-700',
    isHighStakesOnly: true
  },
  {
    id: 'hs-leverage',
    title: '📉 Кредитное плечо',
    description: 'Игра на бирже с плечом x100. Пан или пропал.',
    type: 'high_stakes',
    rarity: 'rare',
    cost: 15000,
    riskOutcome: { 
      winChance: 0.15, 
      winCash: 150000, 
      lossCash: -15000,
      winText: 'Идеальный вход! Вы поймали дно и закрылись на хаях.',
      lossText: 'Ликвидация. Рынок пошел против вас, позиция принудительно закрыта.'
    },
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-rose-900',
    isHighStakesOnly: true
  },
  {
    id: 'hs-big-deal',
    title: '🏢 Торговый центр',
    description: 'Покупка доли в крупном торговом комплексе.',
    type: 'high_stakes',
    rarity: 'common',
    cost: 20000,
    incomeChange: 4000,
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-blue-900',
    isHighStakesOnly: true
  },
  {
    id: 'hs-tech-ipo',
    title: '💹 Тех-IPO',
    description: 'Покупка акций на первичном размещении.',
    type: 'high_stakes',
    rarity: 'common',
    cost: 12000,
    incomeChange: 2500,
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-blue-800',
    isHighStakesOnly: true
  }
];

const MAX_TURNS = 30;

type GameState = 'intro' | 'rolling' | 'rolling_animation' | 'suspense' | 'event' | 'botTurn' | 'freedom_celebration' | 'high_stakes_intro' | 'gameOver';
type PlayerLevel = 'Новичок' | 'Инвестор' | 'Магнат' | 'Миллионер';

export const CashFlowGame = ({ onUpdate, onMove, onEnd }: { 
  onUpdate: (s: number) => void, 
  onMove: () => void, 
  onEnd: (s: number, m: number, v: boolean, q: number) => void 
}) => {
  const [role, setRole] = useState<Role | null>(null);
  const [player, setPlayer] = useState({ 
    cash: 0, 
    passiveIncome: 0, 
    expenses: 0, 
    salary: 0,
    streak: 0,
    multiplier: 1,
    level: 'Новичок' as PlayerLevel
  });
  const [bot, setBot] = useState({ cash: 1000, passiveIncome: 0, expenses: 800, salary: 1000 });
  
  const [turn, setTurn] = useState(1);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [isHighStakes, setIsHighStakes] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [botEvent, setBotEvent] = useState<GameEvent | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [recentEventIds, setRecentEventIds] = useState<string[]>([]);
  const [riskResult, setRiskResult] = useState<{ win: boolean, amount: number } | null>(null);
  const [choiceFeedback, setChoiceFeedback] = useState<'success' | 'danger' | 'warning' | null>(null);
  const [risksTaken, setRisksTaken] = useState(0);

  // Refs for latest state to avoid stale closures in timeouts/callbacks
  const stateRef = useRef({ player, bot, turn, risksTaken, currentEvent, gameState });
  useEffect(() => {
    stateRef.current = { player, bot, turn, risksTaken, currentEvent, gameState };
  }, [player, bot, turn, risksTaken, currentEvent, gameState]);

  // Sync score with passive income
  useEffect(() => {
    onUpdate(player.passiveIncome * 10);
  }, [player.passiveIncome, onUpdate]);

  // Debug logging for state synchronization
  useEffect(() => {
    console.log(`[CashFlow Debug] Player State: Cash=${player.cash}, Income=${player.passiveIncome}, Expenses=${player.expenses}, Salary=${player.salary}, Turn=${turn}`);
  }, [player.cash, player.passiveIncome, turn, player.expenses, player.salary]);

  const addLog = useCallback((msg: string) => setLog(prev => [msg, ...prev].slice(0, 3)), []);

  const triggerFeedback = useCallback((type: 'success' | 'danger' | 'warning') => {
    setChoiceFeedback(type);
    setTimeout(() => setChoiceFeedback(null), 500);
  }, []);

  const startGame = (selectedRole: Role) => {
    setRole(selectedRole);
    setPlayer({
      cash: selectedRole.startCash,
      passiveIncome: 0,
      expenses: selectedRole.expenses,
      salary: selectedRole.salary,
      streak: 0,
      multiplier: 1,
      level: 'Новичок'
    });
    const botRole = ROLES[Math.floor(Math.random() * ROLES.length)];
    setBot({
      cash: botRole.startCash,
      passiveIncome: 0,
      expenses: botRole.expenses,
      salary: botRole.salary
    });
    setGameState('rolling');
    addLog(`Вы начали как ${selectedRole.name}`);
    console.log(`[CashFlow] Game started for ${selectedRole.name}. Start Cash: ${selectedRole.startCash}`);
  };

  const checkGameOver = useCallback((p: any, b: any, currentTurn: number, risks: number) => {
    const pWins = p.passiveIncome >= p.expenses;
    const bWins = b.passiveIncome >= b.expenses;
    
    const riskBonus = Math.min(0.5, risks * 0.1);
    const cashBonus = Math.min(0.2, p.cash / 50000);
    const streakBonus = (p.multiplier - 1) * 0.5;

    if (pWins && !isHighStakes) {
      setGameState('freedom_celebration');
      return true;
    }

    if (bWins) {
      onEnd(p.passiveIncome * 10 + p.cash / 10, currentTurn, false, 0.5 + riskBonus + streakBonus);
      setGameState('gameOver');
      return true;
    }

    if (currentTurn >= MAX_TURNS) {
      const victory = p.passiveIncome > b.passiveIncome;
      onEnd(p.passiveIncome * 10 + p.cash / 10, currentTurn, victory, (victory ? 1.0 : 0.5) + riskBonus + cashBonus + streakBonus);
      setGameState('gameOver');
      return true;
    }
    return false;
  }, [onEnd, isHighStakes]);

  const selectEvent = useCallback((highStakes: boolean) => {
    let pool = EVENTS.filter(e => !recentEventIds.includes(e.id));
    
    if (highStakes) {
      pool = pool.filter(e => e.type === 'high_stakes' || e.type === 'risk' || e.rarity !== 'common');
    } else {
      pool = pool.filter(e => !e.isHighStakesOnly);
    }

    const jackpotPool = pool.filter(e => e.rarity === 'jackpot');
    const rarePool = pool.filter(e => e.rarity === 'rare');
    const commonPool = pool.filter(e => e.rarity === 'common');

    const rand = Math.random();
    let selected: GameEvent;

    if (rand < 0.05 && jackpotPool.length > 0) {
      selected = jackpotPool[Math.floor(Math.random() * jackpotPool.length)];
    } else if (rand < 0.25 && rarePool.length > 0) {
      selected = rarePool[Math.floor(Math.random() * rarePool.length)];
    } else {
      selected = commonPool[Math.floor(Math.random() * commonPool.length)];
    }

    setRecentEventIds(prev => [...prev, selected.id].slice(-5));
    return selected;
  }, [recentEventIds]);

  const processBotTurn = useCallback(() => {
    const { player: p, bot: b, turn: t, risksTaken: r } = stateRef.current;
    const event = selectEvent(false);
    setBotEvent(event);
    
    console.log(`[CashFlow] Bot Turn Started. Event: ${event.title}`);
    
    setTimeout(() => {
      let accepted = false;
      if (event.type === 'work' || event.type === 'expense') {
        accepted = true;
      } else if (event.cost && b.cash >= event.cost) {
        if (event.type === 'risk' || event.type === 'high_stakes') {
          accepted = b.cash > event.cost * 3;
        } else {
          accepted = true;
        }
      }

      setBot(prev => {
        let bCash = prev.cash;
        let bIncome = prev.passiveIncome;
        let bExpenses = prev.expenses;

        if (accepted) {
          if ((event.type === 'risk' || event.type === 'high_stakes') && event.riskOutcome) {
            const win = Math.random() < event.riskOutcome.winChance;
            const amount = win ? event.riskOutcome.winCash : event.riskOutcome.lossCash;
            bCash += amount;
            
            setTimeout(() => {
              addLog(win ? `🔥 Бот сорвал куш на ${event.title}!` : `💀 Бот прогорел на ${event.title}`);
            }, 0);
          } else {
            const cashDelta = (event.cashChange || 0) - (event.cost || 0);
            const salaryDelta = event.type === 'work' ? (prev.salary + prev.passiveIncome - prev.expenses) : 0;
            bCash += cashDelta + salaryDelta;
            bIncome += (event.incomeChange || 0);
            bExpenses += (event.expenseChange || 0);
            
            setTimeout(() => {
              addLog(`🤖 Бот: ${event.title}`);
            }, 0);
          }
        }

        console.log(`[CashFlow] Bot State Updated: Cash=${bCash}, Income=${bIncome}, Expenses=${bExpenses}`);
        return { ...prev, cash: bCash, passiveIncome: bIncome, expenses: bExpenses };
      });

      setTurn(prevTurn => {
        const nextTurn = prevTurn + 1;
        // We check game over with the latest bot state in the next render cycle via useEffect or here
        // For simplicity, we check with the calculated values
        const bProgress = (b.passiveIncome / b.expenses) * 100;
        if (bProgress > 85) {
           setTimeout(() => addLog(`⚠️ Бот дышит в спину! Он почти свободен!`), 0);
        }

        if (!checkGameOver(p, b, nextTurn, r)) {
          setGameState('rolling');
        }
        return nextTurn;
      });
      
      setBotEvent(null);
    }, 1200);
  }, [selectEvent, checkGameOver, addLog]);

  // Handle turn transitions and game over checks
  useEffect(() => {
    if (gameState === 'botTurn' && !botEvent) {
      const timer = setTimeout(() => {
        processBotTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, botEvent, processBotTurn]);

  const handleRoll = () => {
    if (gameState !== 'rolling') return;
    setGameState('rolling_animation');
    
    setTimeout(() => {
      setGameState('suspense');
      setTimeout(() => {
        const event = selectEvent(isHighStakes);
        setCurrentEvent(event);
        setGameState('event');
        setRiskResult(null);
        onMove();
      }, 400);
    }, 600);
  };

  const handleChoice = useCallback((accept: boolean) => {
    const { currentEvent: ev, player: p, bot: b, turn: t, risksTaken: r } = stateRef.current;
    if (!ev) return;

    console.log(`[CashFlow] Handling choice for: ${ev.title}, accept: ${accept}`);

    if (accept) {
      if ((ev.type === 'risk' || ev.type === 'high_stakes') && ev.riskOutcome) {
        triggerFeedback('warning');
        const win = Math.random() < ev.riskOutcome.winChance;
        const amount = win ? ev.riskOutcome.winCash : ev.riskOutcome.lossCash;
        
        setRiskResult({ win, amount });
        setRisksTaken(prev => prev + 1);
        
        setTimeout(() => {
          setPlayer(prev => {
            const nextCash = prev.cash + amount;
            const nextStreak = win ? prev.streak + 1 : 0;
            const nextMultiplier = Math.min(2.5, 1 + (nextStreak * 0.2));
            const nextLevel = nextCash > 50000 ? 'Миллионер' : nextCash > 20000 ? 'Магнат' : nextCash > 5000 ? 'Инвестор' : 'Новичок';
            
            console.log(`[CashFlow] Risk Result Applied: ${win ? 'WIN' : 'LOSS'}, Amount: ${amount}, New Cash: ${nextCash}`);
            
            return {
              ...prev, 
              cash: nextCash, 
              streak: nextStreak, 
              multiplier: nextMultiplier,
              level: nextLevel
            };
          });

          addLog(win ? `✅ Успешно: ${ev.title} (+${amount}$)` : `❌ Неудача: ${ev.title} (${amount}$)`);
          setCurrentEvent(null);
          setGameState('botTurn');
        }, 1500);
        return;
      } else {
        triggerFeedback('success');
        const cashDelta = (ev.cashChange || 0) - (ev.cost || 0);
        const incomeDelta = (ev.incomeChange || 0);
        const expenseDelta = (ev.expenseChange || 0);
        
        setPlayer(prev => {
          const salaryDelta = ev.type === 'work' ? (prev.salary + prev.passiveIncome - prev.expenses) : 0;
          const totalCashDelta = cashDelta + salaryDelta;
          const nextCash = prev.cash + totalCashDelta;
          const nextIncome = prev.passiveIncome + incomeDelta;
          const nextExpenses = prev.expenses + expenseDelta;
          const nextStreak = ev.type === 'deal' ? prev.streak + 0.5 : prev.streak;
          const nextMultiplier = Math.min(2.5, 1 + (Math.floor(nextStreak) * 0.2));
          const nextLevel = nextCash > 50000 ? 'Миллионер' : nextCash > 20000 ? 'Магнат' : nextCash > 5000 ? 'Инвестор' : 'Новичок';

          console.log(`[CashFlow] Event Applied: ${ev.title}, Cash Delta: ${totalCashDelta}, Income Delta: ${incomeDelta}, Expense Delta: ${expenseDelta}, New Cash: ${nextCash}, New Income: ${nextIncome}, New Expenses: ${nextExpenses}`);
          
          setTimeout(() => {
            addLog(`Вы: ${ev.title} (${totalCashDelta >= 0 ? '+' : ''}${totalCashDelta}$)`);
          }, 0);

          return {
            ...prev,
            cash: nextCash,
            passiveIncome: nextIncome,
            expenses: nextExpenses,
            streak: nextStreak,
            multiplier: nextMultiplier,
            level: nextLevel
          };
        });
      }
    } else {
      if (ev.type === 'expense' && ev.riskOutcome) {
        triggerFeedback('warning');
        setRisksTaken(prev => prev + 1);
        
        const win = Math.random() < ev.riskOutcome.winChance;
        const amount = win ? ev.riskOutcome.winCash : ev.riskOutcome.lossCash;
        
        setRiskResult({ win, amount });
        
        setTimeout(() => {
          setPlayer(prev => {
            const nextCash = prev.cash + amount;
            const nextStreak = win ? prev.streak + 0.5 : 0;
            const nextMultiplier = Math.min(2.5, 1 + (Math.floor(nextStreak) * 0.2));
            return { ...prev, cash: nextCash, streak: nextStreak, multiplier: nextMultiplier };
          });
          
          addLog(win ? `🛡️ Избежали: ${ev.title}` : `💥 Попались: ${ev.title} (${amount}$)`);
          setCurrentEvent(null);
          setGameState('botTurn');
        }, 1500);
        return;
      } else {
        triggerFeedback('danger');
        addLog(`Вы пропустили: ${ev.title}`);
      }
    }

    setCurrentEvent(null);
    setGameState('botTurn');
  }, [triggerFeedback, addLog]);

  // Auto-apply logic for events with isAutoApply: true
  useEffect(() => {
    if (gameState === 'event' && currentEvent?.isAutoApply) {
      const timer = setTimeout(() => {
        handleChoice(true);
      }, 2000);

      // Safeguard: force turn end if stuck in event state
      const safeguard = setTimeout(() => {
        if (stateRef.current.gameState === 'event') {
          console.warn("Safeguard: Auto-apply stuck, forcing next turn");
          handleChoice(true);
        }
      }, 4500);

      return () => {
        clearTimeout(timer);
        clearTimeout(safeguard);
      };
    }
  }, [gameState, currentEvent?.id, currentEvent?.isAutoApply, handleChoice]);

  const playerProgress = Math.min(100, (player.passiveIncome / player.expenses) * 100);
  const botProgress = Math.min(100, (bot.passiveIncome / bot.expenses) * 100);
  const isPlayerFree = player.passiveIncome >= player.expenses;
  const isBotClose = botProgress >= 80;

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-6 items-center justify-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Выберите роль</h1>
          <p className="text-slate-500 font-medium">С чего начнется ваш путь к свободе?</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
          {ROLES.map((r) => (
            <button
              key={r.name}
              onClick={() => startGame(r)}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover:border-blue-500 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                {r.icon}
              </div>
              <div>
                <h3 className="font-black text-slate-800">{r.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Зарплата: ${r.salary} • Расходы: ${r.expenses}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden transition-colors duration-1000 ${isHighStakes ? 'bg-amber-50' : 'bg-slate-50'}`}>
      {/* Choice Feedback Overlay */}
      <AnimatePresence>
        {choiceFeedback && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 pointer-events-none ${
              choiceFeedback === 'success' ? 'bg-emerald-500' : 
              choiceFeedback === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Top Bar: Progress & Status */}
      <div className={`p-4 border-b shadow-sm z-10 transition-colors duration-1000 ${isHighStakes ? 'bg-white/80 backdrop-blur-md border-amber-100' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <motion.div 
              animate={isPlayerFree ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isHighStakes ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : isPlayerFree ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-600'}`}
            >
              {isHighStakes ? 'Большая игра' : isPlayerFree ? 'Свобода' : 'Крысиные бега'}
            </motion.div>
            <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${isHighStakes ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
              {player.level}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {player.multiplier > 1 && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black"
              >
                <Flame className="w-3 h-3" /> x{player.multiplier.toFixed(1)}
              </motion.div>
            )}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ход {turn}/{MAX_TURNS}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Вы: ${player.passiveIncome} / ${player.expenses}
              </span>
              <span className={`text-[10px] font-black ${playerProgress > 80 ? 'text-emerald-600' : 'text-blue-600'}`}>{Math.round(playerProgress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${isHighStakes ? 'bg-amber-500' : playerProgress > 80 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                animate={{ width: `${playerProgress}%` }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className={`space-y-1.5 transition-opacity ${isBotClose ? 'opacity-100' : 'opacity-40'}`}>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Бот: ${bot.passiveIncome} / ${bot.expenses}
              </span>
              <span className={`text-[10px] font-black ${isBotClose ? 'text-rose-500' : 'text-slate-500'}`}>{Math.round(botProgress)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${isBotClose ? 'bg-rose-500' : 'bg-slate-400'}`} 
                animate={{ width: `${botProgress}%` }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-3 z-10">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">Наличные</p>
          <p className="text-xl font-black text-slate-900">${player.cash}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">Доход</p>
          <p className="text-xl font-black text-emerald-600">${player.passiveIncome}</p>
          {playerProgress > 0 && (
            <div className={`absolute bottom-0 left-0 h-0.5 opacity-20 ${isHighStakes ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${playerProgress}%` }} />
          )}
        </div>
      </div>

      {/* Event Area */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {gameState === 'rolling' && (
            <motion.div 
              key="rolling" 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 1.1, opacity: 0 }} 
              className="text-center space-y-4 w-full"
            >
              <div className="w-28 h-28 bg-blue-600 rounded-[36px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200">
                <Dice6 className="w-14 h-14 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-800">Ваш ход</h2>
                <p className="text-sm text-slate-400 font-medium">Бросьте кубик для события</p>
              </div>
              <Button 
                onClick={handleRoll} 
                className="w-full max-w-xs py-6 rounded-[24px] text-lg shadow-xl shadow-blue-100 active:scale-95 transition-transform"
              >
                Бросить кубик
              </Button>
            </motion.div>
          )}

          {gameState === 'rolling_animation' && (
            <motion.div 
              key="rolling_anim"
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              className="w-28 h-28 bg-blue-600 rounded-[36px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200"
            >
              <Dice6 className="w-14 h-14 text-white" />
            </motion.div>
          )}

          {gameState === 'suspense' && (
            <motion.div 
              key="suspense"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                ))}
              </div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Генерация события...</p>
            </motion.div>
          )}

          {gameState === 'event' && currentEvent && (
            <motion.div 
              key="event"
              initial={{ y: 100, opacity: 0, scale: 0.8 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: -100, opacity: 0, scale: 1.1 }}
              className={`w-full max-w-sm rounded-[40px] p-8 shadow-2xl border flex flex-col items-center text-center space-y-6 relative ${isHighStakes ? 'bg-white border-amber-200 shadow-amber-100' : 'bg-white border-slate-100'}`}
            >
              <div className={`w-24 h-24 ${currentEvent.color} rounded-[32px] flex items-center justify-center text-white shadow-lg mb-2 relative`}>
                {React.cloneElement(currentEvent.icon as React.ReactElement, { className: 'w-10 h-10' })}
                {currentEvent.rarity === 'jackpot' && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-md"
                  >
                    <Star className="w-4 h-4 fill-white" />
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{currentEvent.title}</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">{currentEvent.description}</p>
              </div>

              {riskResult ? (
                <motion.div 
                  initial={{ scale: 0.8, rotate: -5 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  className={`p-5 rounded-3xl w-full font-black flex flex-col items-center justify-center ${riskResult.win ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  <div className="flex items-center gap-2 text-2xl mb-2">
                    {riskResult.win ? <Sparkles className="w-8 h-8" /> : <ZapOff className="w-8 h-8" />}
                    {riskResult.win ? 'УСПЕХ!' : 'ПРОВАЛ'}
                  </div>
                  <p className="text-sm font-bold text-center mb-2 leading-tight">
                    {riskResult.win ? (currentEvent.riskOutcome?.winText || 'Вам повезло!') : (currentEvent.riskOutcome?.lossText || 'Не в этот раз...')}
                  </p>
                  <div className="text-xl opacity-80">{riskResult.win ? '+' : ''}{riskResult.amount}$</div>
                </motion.div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="w-full flex flex-col gap-2 bg-slate-50 p-5 rounded-3xl">
                    {/* Cash Block */}
                    {(() => {
                      const netCash = currentEvent.type === 'work' 
                        ? (player.salary + player.passiveIncome - player.expenses + (currentEvent.cashChange || 0))
                        : (currentEvent.cashChange || 0) - (currentEvent.cost || 0);
                      
                      if (netCash === 0) return null;
                      
                      return (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Наличные</span>
                          <span className={`text-lg font-black ${netCash > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {netCash > 0 ? '+' : ''}{netCash}$
                          </span>
                        </div>
                      );
                    })()}

                    {/* Income Block */}
                    {currentEvent.incomeChange && currentEvent.incomeChange !== 0 ? (
                      <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Доход</span>
                        <span className={`text-lg font-black ${currentEvent.incomeChange > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {currentEvent.incomeChange > 0 ? '+' : ''}{currentEvent.incomeChange}$
                        </span>
                      </div>
                    ) : null}

                    {/* Expense Block */}
                    {currentEvent.expenseChange && currentEvent.expenseChange !== 0 ? (
                      <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Расход (мес)</span>
                        <span className={`text-lg font-black ${currentEvent.expenseChange > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {currentEvent.expenseChange > 0 ? '+' : '-'}{Math.abs(currentEvent.expenseChange)}$
                        </span>
                      </div>
                    ) : null}
                    
                    {/* If everything is zero (shouldn't happen with current events but for safety) */}
                    {!(currentEvent.incomeChange || currentEvent.expenseChange || (currentEvent.type === 'work' || currentEvent.cashChange || currentEvent.cost)) && (
                      <div className="text-center py-2 text-slate-400 text-xs font-bold uppercase">Без изменений</div>
                    )}
                  </div>
                  
                  {currentEvent.riskOutcome && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 rounded-xl">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                        Шанс успеха: {Math.round(currentEvent.riskOutcome.winChance * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!riskResult && !currentEvent.isAutoApply && (
                <div className="w-full flex flex-col gap-3">
                  <Button 
                    onClick={() => handleChoice(true)} 
                    disabled={player.cash < (currentEvent.cost || 0)} 
                    className={`w-full py-5 rounded-2xl text-lg shadow-lg active:scale-95 transition-transform ${
                      currentEvent.type === 'risk' || currentEvent.type === 'high_stakes' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 
                      currentEvent.type === 'deal' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 
                      currentEvent.type === 'expense' ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-100' :
                      'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                    }`}
                  >
                    {currentEvent.type === 'risk' || currentEvent.type === 'high_stakes' ? 'Рискнуть' : 
                     currentEvent.type === 'deal' ? 'Купить' : 
                     currentEvent.type === 'expense' ? 'Оплатить' : 'Принять'}
                  </Button>
                  
                  {(currentEvent.type === 'deal' || currentEvent.type === 'risk' || currentEvent.type === 'high_stakes' || currentEvent.type === 'expense') && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleChoice(false)} 
                      className={`w-full py-4 rounded-2xl active:scale-95 transition-transform ${
                        currentEvent.type === 'expense' ? 'text-amber-600 hover:text-amber-700 font-black' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {currentEvent.type === 'expense' ? 'Рискнуть (избежать)' : 'Пропустить'}
                    </Button>
                  )}
                </div>
              )}

              {currentEvent.isAutoApply && !riskResult && (
                <div className="w-full py-4 flex flex-col items-center">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-48 mx-auto">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: "linear" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-3 animate-pulse">Применяется автоматически...</p>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'freedom_celebration' && (
            <motion.div 
              key="freedom"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl border-4 border-emerald-100"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-800">Вы свободны!</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Вы вырвались из крысиных бегов. Ваши пассивные доходы превысили расходы!
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Готовы к большой игре?</p>
                <Button 
                  onClick={() => setGameState('high_stakes_intro')}
                  className="w-full py-6 rounded-3xl text-xl bg-emerald-600 shadow-xl shadow-emerald-100"
                >
                  Начать Большую Игру
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === 'high_stakes_intro' && (
            <motion.div 
              key="hs_intro"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 w-full max-w-sm bg-slate-900 rounded-[40px] p-10 shadow-2xl"
            >
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-900/40">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">Режим Высоких Ставок</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Здесь крутятся миллионы. Крипта, стартапы и крупные сделки. Риск огромен, но награда — бесконечна.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setIsHighStakes(true);
                  setGameState('rolling');
                  addLog("🚀 ДОБРО ПОЖАЛОВАТЬ В БОЛЬШУЮ ИГРУ!");
                }}
                className="w-full py-6 rounded-3xl text-xl bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-900/20"
              >
                Поехали!
              </Button>
            </motion.div>
          )}

          {gameState === 'botTurn' && (
            <motion.div key="botTurn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="w-24 h-24 bg-slate-200 rounded-[32px] flex items-center justify-center mx-auto animate-pulse">
                <Cpu className="w-12 h-12 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Ход бота</h3>
                <p className="text-sm text-slate-300 font-medium">Бот принимает решение...</p>
              </div>
              {botEvent && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 10 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 ${botEvent.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                    {React.cloneElement(botEvent.icon as React.ReactElement, { className: 'w-5 h-5' })}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase">Событие бота</p>
                    <span className="text-sm font-black text-slate-700">{botEvent.title}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Log Section */}
      <div className="px-4 py-4 bg-white border-t border-slate-100 mt-auto">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">История событий</h4>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Live</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {log.length > 0 ? log.map((entry, i) => (
            <motion.div 
              key={i} 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`flex items-center gap-3 text-[11px] font-bold ${i === 0 ? 'text-slate-900' : 'text-slate-300'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              {entry}
            </motion.div>
          )) : (
            <p className="text-[11px] font-bold text-slate-200 italic">Ожидание действий...</p>
          )}
        </div>
      </div>
    </div>
  );
};


