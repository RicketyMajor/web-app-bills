import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// YYYY-MM-DD in local time
const isoDate = (d) => d.toLocaleDateString("en-CA");

// Income minus expenses for the current month. RLS scopes rows to the user.
// ponytail: sums client-side; move to a SQL view/RPC if monthly rows grow large
export function useMonthBalance() {
  const now = new Date();
  const start = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = isoDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));

  return useQuery({
    queryKey: ["balance", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("amount, categories!inner(type)")
        .gte("date", start)
        .lt("date", end);
      if (error) throw error;
      return data.reduce(
        (sum, row) =>
          sum + (row.categories.type === "income" ? 1 : -1) * Number(row.amount),
        0
      );
    },
  });
}
