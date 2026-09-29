import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

// Goals with every contribution (saved = their sum). RLS scopes rows to the user.
export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, name, icon, target, deadline, created_at, goal_contributions(id, amount, date, note, created_at)")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

const invalidate = (queryClient) => queryClient.invalidateQueries({ queryKey: ["goals"] });

// Inserts when there's no id, updates otherwise. Resolves to the goal's id (the page selects it).
export function useSaveGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      if (id) {
        const { error } = await supabase.from("goals").update(fields).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase.from("goals").insert(fields).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

// Its contributions go too (on delete cascade)
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

// amount is signed: negative = withdrawal
export function useAddContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fields) => {
      const { error } = await supabase.from("goal_contributions").insert(fields);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("goal_contributions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}
