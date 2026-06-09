import moment from "moment";
import { create } from "zustand";

const defaultStartDate = moment().subtract(1, "week").format("YYYY-MM-DD");
const defaultEndDate = moment().format("YYYY-MM-DD");

interface DateRangeState {
  startDate: string | null;
  endDate: string | null;
  rangeVersion: number;
  setRange: (start: string | null, end: string | null) => void;
  clear: () => void;
}

export const useDateRangeStore = create<DateRangeState>((set) => ({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  rangeVersion: 0,
  setRange: (start, end) =>
    set((state) => ({
      startDate: start,
      endDate: end,
      rangeVersion: state.rangeVersion + 1,
    })),
  clear: () =>
    set((state) => ({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      rangeVersion: state.rangeVersion + 1,
    })),
}));
