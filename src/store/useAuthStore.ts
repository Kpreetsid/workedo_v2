import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/src/storage/mmkv';

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => storage.set(name, value),
        getItem: (name) => storage.getString(name) ?? null,
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
