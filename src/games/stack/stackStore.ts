import { create } from 'zustand';

interface StackState {
  level: number;
  blockWidth: number;
  speed: number;
  status: 'playing' | 'gameover' | 'idle';
  
  reset: () => void;
  nextLevel: (newWidth: number) => void;
  setGameOver: () => void;
  startGame: () => void;
}

export const useStackStore = create<StackState>((set) => ({
  level: 0,
  blockWidth: 25, // percentage of container width
  speed: 1.5, // seconds for one full swing (faster than 2)
  status: 'idle',

  reset: () => set({
    level: 0,
    blockWidth: 25,
    speed: 1.5,
    status: 'idle'
  }),

  startGame: () => set({ status: 'playing' }),

  nextLevel: (newWidth: number) => set((state) => ({
    level: state.level + 1,
    blockWidth: newWidth,
    speed: Math.max(0.8, state.speed * 0.95) // increase speed (decrease duration)
  })),

  setGameOver: () => set({ status: 'gameover' })
}));
