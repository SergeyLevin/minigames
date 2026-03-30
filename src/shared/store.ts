import { create } from 'zustand';
import { UserProfile, recommenduyAdapter } from '../integrations/recommenduy';

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  crashAttempts: {
    used: number;
    lastDate: string;
  };
  
  fetchUser: () => Promise<void>;
  addCrystals: (amount: number) => void;
  useCrashAttempt: () => void;
  resetCrashAttempts: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  crashAttempts: JSON.parse(localStorage.getItem('crash_attempts') || '{"used":0,"lastDate":""}'),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await recommenduyAdapter.getCurrentUser();
      
      // Check if day changed for crash attempts
      const today = new Date().toISOString().split('T')[0];
      set((state) => {
        if (state.crashAttempts.lastDate !== today) {
          const newAttempts = { used: 0, lastDate: today };
          localStorage.setItem('crash_attempts', JSON.stringify(newAttempts));
          return { user, isLoading: false, crashAttempts: newAttempts };
        }
        return { user, isLoading: false };
      });
    } catch (err) {
      set({ error: "Ошибка загрузки профиля", isLoading: false });
    }
  },

  addCrystals: (amount: number) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          currentBalances: {
            ...state.user.currentBalances,
            crystals: state.user.currentBalances.crystals + amount
          }
        }
      };
    });
  },

  useCrashAttempt: () => {
    set((state) => {
      const newAttempts = { ...state.crashAttempts, used: state.crashAttempts.used + 1 };
      localStorage.setItem('crash_attempts', JSON.stringify(newAttempts));
      return { crashAttempts: newAttempts };
    });
  },

  resetCrashAttempts: () => {
    const today = new Date().toISOString().split('T')[0];
    const newAttempts = { used: 0, lastDate: today };
    localStorage.setItem('crash_attempts', JSON.stringify(newAttempts));
    set({ crashAttempts: newAttempts });
  }
}));
