import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// Postgres error codes surfaced by PostgREST
const friendlyErrors = {
  23505: "You already have a category with that name.",
  23503: "This category has movements. Delete or move them first.",
};

export const categoryErrorMessage = (error) =>
  friendlyErrors[error?.code] ?? "Something went wrong. Please try again.";

// type: 'income' | 'expense'. RLS scopes rows to the user.
export function useCategories(type) {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, type, icon, color")
        .eq("type", type)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

// Movement rows show the category's name, icon and color
const invalidate = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["categories"] }),
    queryClient.invalidateQueries({ queryKey: ["movements"] }),
  ]);

// Inserts when there's no id, updates otherwise.
export function useSaveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const table = supabase.from("categories");
      const { error } = await (id ? table.update(fields).eq("id", id) : table.insert(fields));
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

// Fails with 23503 when movements still reference the category (FK).
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}
