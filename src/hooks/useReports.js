import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { shiftMonth } from "../utils/movements";
import { lastMonths, monthlyTotals, totalsByCategory } from "../utils/reports";

// Keys live under 'movements' so movement and category mutations refresh them.
export function useMonthlyTrend(month, n = 6) {
  return useQuery({
    queryKey: ["movements", "trend", month, n],
    queryFn: async () => {
      const months = lastMonths(month, n);
      const { data, error } = await supabase
        .from("movements")
        .select("amount, date, categories!inner(type)")
        .gte("date", months[0])
        .lt("date", shiftMonth(month, 1));
      if (error) throw error;
      return monthlyTotals(data, months);
    },
  });
}

export function useCategoryBreakdown(month, type) {
  return useQuery({
    queryKey: ["movements", "breakdown", month, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("amount, categories!inner(id, name, icon, color, type)")
        .eq("categories.type", type)
        .gte("date", month)
        .lt("date", shiftMonth(month, 1));
      if (error) throw error;
      return totalsByCategory(data);
    },
  });
}
