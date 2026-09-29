import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { shiftMonth } from "../utils/movements";
import { overrideMap, spentByMonth } from "../utils/budgets";

// Expense spend for `month` and the month before + those months' overrides (utils/budgets.js).
// Under 'movements' so movement and category saves refresh it.
// ponytail: two months of expenses stay far below PostgREST's 1000-row cap at personal scale
export function useBudgetMonth(month, enabled = true) {
  return useQuery({
    queryKey: ["movements", "budgets", month],
    queryFn: async () => {
      const prev = shiftMonth(month, -1);
      const [movements, overrides] = await Promise.all([
        supabase
          .from("movements")
          .select("amount, date, category_id, categories!inner(type)")
          .eq("categories.type", "expense")
          .gte("date", prev)
          .lt("date", shiftMonth(month, 1)),
        supabase.from("budget_overrides").select("category_id, month, amount").in("month", [prev, month]),
      ]);
      if (movements.error) throw movements.error;
      if (overrides.error) throw overrides.error;
      return { ...spentByMonth(movements.data, month), overrides: overrideMap(overrides.data) };
    },
    enabled,
  });
}

// The category's base budget + rollover, then the month's override (upserted, or removed when empty)
export function useSaveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, month, budget, rollover, override }) => {
      const saved = await supabase.from("categories").update({ budget, rollover }).eq("id", categoryId);
      if (saved.error) throw saved.error;
      const table = supabase.from("budget_overrides");
      const { error } = override
        ? await table.upsert({ category_id: categoryId, month, amount: override }, { onConflict: "category_id,month" })
        : await table.delete().eq("category_id", categoryId).eq("month", month);
      if (error) throw error;
    },
    // Also on failure: the category update may have landed before the override write failed
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["movements", "budgets"] }),
      ]),
  });
}
