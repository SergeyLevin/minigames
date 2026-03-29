/**
 * Адаптер для интеграции с хост-приложением "Рекомендуй"
 */

export interface UserProfile {
  userId: string;
  phone: string;
  displayName: string;
  avatarUrl: string;
  currentBalances: {
    crystals: number;
    silver: number;
    gold: number;
  };
}

export interface GameSessionResult {
  gameId: string;
  score: number;
  duration: number;
  crystalsEarned: number;
  metadata?: any;
}

export interface RecommenduyIntegration {
  getCurrentUser(): Promise<UserProfile>;
  saveGameSession(payload: GameSessionResult): Promise<{ success: boolean; crystalsAwarded: number }>;
  closeMiniApp(): void;
  openCurrencyInfo(): void;
}

// Mock реализация для разработки
const mockUser: UserProfile = {
  userId: "user_123",
  phone: "+7 (999) 000-00-00",
  displayName: "Александр Игроков",
  avatarUrl: "https://picsum.photos/seed/user123/100/100",
  currentBalances: {
    crystals: 1250,
    silver: 1,
    gold: 0
  }
};

export const recommenduyAdapter: RecommenduyIntegration = {
  getCurrentUser: async () => {
    // В реальности здесь будет вызов через window.webkit.messageHandlers или аналоги
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUser), 500);
    });
  },
  saveGameSession: async (payload) => {
    console.log("Saving game session to Recommenduy:", payload);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, crystalsAwarded: payload.crystalsEarned }), 800);
    });
  },
  closeMiniApp: () => {
    console.log("Closing Mini App");
    // window.close() или вызов нативного метода
  },
  openCurrencyInfo: () => {
    console.log("Opening Currency Info in Host App");
  }
};

// Глобальный доступ для отладки
if (typeof window !== 'undefined') {
  (window as any).RecommenduyApp = recommenduyAdapter;
}
