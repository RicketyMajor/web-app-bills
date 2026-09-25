import { create } from "zustand";
import { monthStart, shiftMonth } from "../utils/movements";

// Month shown by Movements and Reports ('YYYY-MM-01'). Not persisted: opens on the current month.
export const useMonthStore = create((set) => ({
  month: monthStart(new Date()),
  shift: (n) => set((s) => ({ month: shiftMonth(s.month, n) })),
}));
