import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { useAuthStore } from "../store/authStore";
import { formatMoney } from "../utils/formatMoney";

// RLS returns only the caller's row. Only this app changes it, so never stale.
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, currency, theme, monthly_budget")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fields) => {
      const id = useAuthStore.getState().session.user.id;
      const { error } = await supabase.from("profiles").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ponytail: USD until the profile loads (one fast query); add a loading gate if the flash shows
export function useMoney() {
  const currency = useProfile().data?.currency;
  return (amount) => formatMoney(amount, currency);
}

// Magnitude without a sign, for totals and "X of Y" lines
export function useBareMoney() {
  const money = useMoney();
  return (amount) => money(Math.abs(amount)).replace("+", "");
}

// Deleting the auth user cascades to profile, categories and movements.
// Local sign-out: the server session died with the user.
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_account");
      if (error) throw error;
      await supabase.auth.signOut({ scope: "local" });
    },
  });
}
