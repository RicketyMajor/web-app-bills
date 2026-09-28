import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { shiftMonth } from "../utils/movements";

// type filters through the category (movements have no type column)
export function useMovements(month, type) {
  return useQuery({
    queryKey: ["movements", month, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("id, amount, description, date, paid, category_id, categories!inner(name, icon, color, type)")
        .eq("categories.type", type)
        .gte("date", month)
        .lt("date", shiftMonth(month, 1))
        .order("date", { ascending: false })
        .order("id", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Latest movements of both types, any month (Home)
export function useRecentMovements(limit = 5) {
  return useQuery({
    queryKey: ["movements", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("id, amount, description, date, paid, categories!inner(name, icon, color, type)")
        .order("date", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

// Not paid yet, any month, oldest first (Home "To pay"). Under 'movements' so saves refresh it.
export function usePendingMovements(limit = 6) {
  return useQuery({
    queryKey: ["movements", "pending", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movements")
        .select("id, amount, description, date, paid, category_id, categories!inner(name, icon, color, type)")
        .eq("paid", false)
        .order("date", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

// Lists and every month's totals depend on movements
const invalidate = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["movements"] }),
    queryClient.invalidateQueries({ queryKey: ["balance"] }),
  ]);

// Inserts when there's no id, updates otherwise.
export function useSaveMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const table = supabase.from("movements");
      const { error } = await (id ? table.update(fields).eq("id", id) : table.insert(fields));
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("movements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}
