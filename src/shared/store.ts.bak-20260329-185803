import { create } from 'zustand';
import { UserProfile, recommenduyAdapter } from '../integrations/recommenduy';

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  fetchUser: () => Promise<void>;
  addCrystals: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await recommenduyAdapter.getCurrentUser();
      set({ user, isLoading: false });
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
  }
}));
