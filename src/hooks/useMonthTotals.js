import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { shiftMonth, sumTotals } from "../utils/movements";

// Income, expense and balance for the month starting at `month` ('YYYY-MM-01').
export function useMonthTotals(month) {
  return useQuery({
    queryKey: ["balance", month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("amount, categories!inner(type)")
        .gte("date", month)
        .lt("date", shiftMonth(month, 1));
      if (error) throw error;
      return sumTotals(data);
    },
  });
}
