import { create } from "zustand";

interface GestureLockState {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
}

export const useGestureLock = create<GestureLockState>((set) => ({
  locked: false,
  lock: () => set({ locked: true }),
  unlock: () => set({ locked: false }),
}));
