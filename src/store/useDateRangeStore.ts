import { create } from "zustand";

interface DateRangeState {
  startDate: string | null;
  endDate: string | null;
  rangeVersion: number;
  setRange: (start: string | null, end: string | null) => void;
  clear: () => void;
}

export const useDateRangeStore = create<DateRangeState>((set) => ({
  startDate: null,
  endDate: null,
  rangeVersion: 0,
  setRange: (start, end) =>
    set((state) => ({
      startDate: start,
      endDate: end,
      rangeVersion: state.rangeVersion + 1,
    })),
  clear: () =>
    set((state) => ({
      startDate: null,
      endDate: null,
      rangeVersion: state.rangeVersion + 1,
    })),
}));
