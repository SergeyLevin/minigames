export interface RewardConfig {
  gameId: string;
  baseReward: number;
  maxPerSession: number;
  dailyLimit: number;
  minDurationSec: number;
  minMoves: number;
}

export const REWARD_CONFIGS: Record<string, RewardConfig> = {
  'match3': {
    gameId: 'match3',
    baseReward: 15, // Increased base reward slightly
    maxPerSession: 80, // Increased max reward
    dailyLimit: 800,
    minDurationSec: 20, // Lowered min duration
    minMoves: 5 // Lowered min moves
  },
  'cashflow': {
    gameId: 'cashflow',
    baseReward: 40,
    maxPerSession: 180,
    dailyLimit: 1000,
    minDurationSec: 60,
    minMoves: 10
  },
  'catan': {
    gameId: 'catan',
    baseReward: 60,
    maxPerSession: 250,
    dailyLimit: 1500,
    minDurationSec: 120,
    minMoves: 15
  }
};

export interface SessionMetrics {
  startTime: number;
  moves: number;
  score: number;
  isVictory: boolean;
  qualityBonus?: number; // 0 to 1
}

export interface RewardBreakdown {
  base: number;
  victoryBonus: number;
  qualityBonus: number;
  penalty: number;
  total: number;
  message?: string;
}

export const calculateRewardBreakdown = (gameId: string, metrics: SessionMetrics): RewardBreakdown => {
  const config = REWARD_CONFIGS[gameId];
  const durationSec = (Date.now() - metrics.startTime) / 1000;
  
  let base = config.baseReward;
  let victoryBonus = 0;
  let qualityBonus = 0;
  let penalty = 0;
  let message = '';

  // Anti-fraud checks
  // For Match-3, any victory is a fair win and shouldn't be penalized
  const isMatch3FairWin = gameId === 'match3' && metrics.isVictory;
  const isCashFlowFairWin = gameId === 'cashflow' && metrics.isVictory && metrics.moves >= 8;
  
  if (!isMatch3FairWin && !isCashFlowFairWin && (durationSec < config.minDurationSec || metrics.moves < config.minMoves)) {
    penalty = base * 0.8;
    // Softer message for Match-3 or no message if they actually played
    if (gameId === 'match3') {
      if (metrics.moves > 0) {
        message = 'Награда скорректирована: сессия была очень короткой.';
      } else {
        message = 'Награда снижена: слишком мало действий.';
      }
    } else {
      message = 'Награда снижена: слишком короткая сессия или мало действий.';
    }
  }

  if (metrics.isVictory) {
    switch (gameId) {
      case 'match3': victoryBonus = 25; break; // Increased victory bonus
      case 'cashflow': victoryBonus = 50; break;
      case 'catan': victoryBonus = 80; break;
    }
  }

  // Quality bonus based on score or specific metrics
  const qBonusMultiplier = metrics.qualityBonus || Math.min(1, metrics.score / 5000);
  switch (gameId) {
    case 'match3': qualityBonus = Math.floor(qBonusMultiplier * 30); break; // Increased quality bonus
    case 'cashflow': qualityBonus = Math.floor(qBonusMultiplier * 60); break;
    case 'catan': qualityBonus = Math.floor(qBonusMultiplier * 80); break;
  }

  let total = Math.max(0, base + victoryBonus + qualityBonus - penalty);
  total = Math.min(total, config.maxPerSession);

  return {
    base,
    victoryBonus,
    qualityBonus,
    penalty,
    total,
    message
  };
};
