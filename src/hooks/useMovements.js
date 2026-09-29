import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { shiftMonth } from "../utils/movements";
import { catKey, categoriesToCreate, movementsToInsert } from "../utils/csvImport";

// type filters through the category (movements have no type column).
// all = every month (Movements search); filters run client-side on these rows.
export function useMovements(month, type, all = false) {
  return useQuery({
    queryKey: ["movements", all ? "all" : month, type],
    queryFn: async () => {
      // ponytail: PostgREST caps at 1000 rows; move filters server-side (view/RPC) if a type's history outgrows it
      let query = supabase
        .from("movements")
        .select("id, amount, description, date, paid, category_id, recurring_id, categories!inner(name, icon, color, type)")
        .eq("categories.type", type);
      if (!all) query = query.gte("date", month).lt("date", shiftMonth(month, 1));
      const { data, error } = await query.order("date", { ascending: false }).order("id", { ascending: false });
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
        .select("id, amount, description, date, paid, category_id, recurring_id, categories!inner(name, icon, color, type)")
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

// Both types, for the import's duplicate check. Under 'movements' so saves refresh it.
export function useMovementsBetween(from, to) {
  return useQuery({
    queryKey: ["movements", "between", from, to],
    // Paged: PostgREST returns at most 1000 rows per request
    queryFn: async () => {
      const rows = [];
      for (let start = 0; ; start += 1000) {
        const { data, error } = await supabase
          .from("movements")
          .select("date, amount, description, category_id")
          .gte("date", from)
          .lte("date", to)
          .order("id")
          .range(start, start + 999);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 1000) return rows;
      }
    },
    enabled: Boolean(from && to),
  });
}

// New categories first (their ids resolve the rows), then every movement in one insert.
// ponytail: two requests, not atomic — if the second fails the new (empty) categories stay; RPC if that ever matters
export function useImportMovements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ plan, selected, mapping }) => {
      const created = new Map();
      const newCategories = categoriesToCreate(plan, selected, mapping);
      if (newCategories.length) {
        const { data, error } = await supabase.from("categories").insert(newCategories).select("id, name, type");
        if (error) throw error;
        for (const c of data) created.set(catKey(c.type, c.name), c.id);
      }
      const { error } = await supabase.from("movements").insert(movementsToInsert(plan, selected, mapping, created));
      if (error) throw error;
    },
    // Also on failure: categories created before a failed movements insert must show up
    // as known, or a retry would try to create them again (23505)
    onSettled: () =>
      Promise.all([invalidate(queryClient), queryClient.invalidateQueries({ queryKey: ["categories"] })]),
  });
}
