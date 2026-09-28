import { create } from "zustand";
import { monthStart, shiftMonth } from "../utils/movements";

// Month shown by Movements and Reports ('YYYY-MM-01'). Not persisted: opens on the current month.
// dir = last step (1 next, -1 previous) so month content can slide the right way.
export const useMonthStore = create((set) => ({
  month: monthStart(new Date()),
  dir: 0,
  shift: (n) => set((s) => ({ month: shiftMonth(s.month, n), dir: Math.sign(n) })),
}));
