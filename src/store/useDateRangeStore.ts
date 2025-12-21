import { create } from "zustand";

interface DateRangeState {
  startDate: string | null;
  endDate: string | null;
  setRange: (start: string | null, end: string | null) => void;
  clear: () => void;
}

export const useDateRangeStore = create<DateRangeState>((set) => ({
  startDate: null,
  endDate: null,
  setRange: (start, end) => set({ startDate: start, endDate: end }),
  clear: () => set({ startDate: null, endDate: null }),
}));
