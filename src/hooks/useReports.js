import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { isoDate, shiftMonth } from "../utils/movements";
import { cumulativeByDay, lastMonths, monthlyTotals, totalsByCategory } from "../utils/reports";

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

// One query covering last month too, for the deltas.
export function useCategoryBreakdown(month, type) {
  return useQuery({
    queryKey: ["movements", "breakdown", month, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("amount, date, categories!inner(id, name, icon, color, type)")
        .eq("categories.type", type)
        .gte("date", shiftMonth(month, -1))
        .lt("date", shiftMonth(month, 1));
      if (error) throw error;
      return totalsByCategory(data, month, isoDate(new Date()));
    },
  });
}

// This month vs last month, day by day (Home). One query covering both months.
export function useCumulativeSpending(month) {
  return useQuery({
    queryKey: ["movements", "cumulative", month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("amount, date, categories!inner(type)")
        .eq("categories.type", "expense")
        .gte("date", shiftMonth(month, -1))
        .lt("date", shiftMonth(month, 1));
      if (error) throw error;
      return cumulativeByDay(data, month, isoDate(new Date()));
    },
  });
}
