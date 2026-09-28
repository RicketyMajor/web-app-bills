import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";
import { isoDate } from "../utils/movements";
import { instancesToCreate } from "../utils/recurring";

// Rules for Settings, oldest first. RLS scopes rows to the user.
export function useRecurring() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring")
        .select("id, amount, description, frequency, anchor, generated_through, active, category_id, categories(name, icon, color, type)")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// Instances are movements: lists, To pay and every total depend on them
const invalidate = (queryClient) =>
  Promise.all(
    ["recurring", "movements", "balance"].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
  );

// Creates every missing instance through the end of this month (spec 15). The unique
// (recurring_id, date) makes it safe to run twice or in two tabs. true = it wrote something.
export async function syncRecurring() {
  const { data: rules, error } = await supabase
    .from("recurring")
    .select("id, category_id, amount, description, frequency, anchor, generated_through, active")
    .eq("active", true);
  if (error) throw error;
  const { inserts, ids, through } = instancesToCreate(rules, isoDate(new Date()));
  if (inserts.length) {
    const { error: insertError } = await supabase
      .from("movements")
      .upsert(inserts, { onConflict: "recurring_id,date", ignoreDuplicates: true });
    if (insertError) throw insertError;
  }
  if (!ids.length) return false;
  // After the insert: if this fails, the next sync inserts again and the unique key ignores it.
  // ponytail: insert + advance aren't atomic, so an instance deleted in that gap can come back once; an RPC would fix it
  const { error: advanceError } = await supabase.from("recurring").update({ generated_through: through }).in("id", ids);
  if (advanceError) throw advanceError;
  return true;
}

// Runs the sync when the app opens, and again in a new month: when the tab comes back or,
// for a window left open, on an hourly check (cheap: it returns early within the month)
export function useSyncRecurring() {
  const queryClient = useQueryClient();
  useEffect(() => {
    let synced = null; // 'YYYY-MM' this tab already synced
    const run = () => {
      const month = isoDate(new Date()).slice(0, 7);
      if (document.hidden || month === synced) return;
      synced = month;
      syncRecurring()
        .then((wrote) => wrote && invalidate(queryClient))
        // Silent: the next open retries; the unique index and generated_through stop duplicates
        .catch(() => {
          synced = null;
        });
    };
    run();
    document.addEventListener("visibilitychange", run);
    const timer = setInterval(run, 60 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", run);
      clearInterval(timer);
    };
  }, [queryClient]);
}

// New movement that repeats: the rule, then this movement as its first instance, then the
// rest of the month. The ref keeps the rule's id so a retry after a failed movement insert
// doesn't create a second rule.
// ponytail: a retry reuses the first rule even if the form changed; recreate it from Settings if needed
export function useAddRecurring() {
  const queryClient = useQueryClient();
  const ruleId = useRef(null);
  return useMutation({
    mutationFn: async ({ frequency, ...movement }) => {
      if (!ruleId.current) {
        const { data, error } = await supabase
          .from("recurring")
          .insert({
            frequency,
            category_id: movement.category_id,
            amount: movement.amount,
            description: movement.description,
            anchor: movement.date,
            generated_through: movement.date,
          })
          .select("id")
          .single();
        if (error) throw error;
        ruleId.current = data.id;
      }
      const { error } = await supabase.from("movements").insert({ ...movement, recurring_id: ruleId.current });
      if (error) throw error;
      await syncRecurring().catch(() => {}); // the rest of the month; the next open retries
    },
    onSuccess: () => {
      ruleId.current = null; // the next repeating movement gets its own rule
      return invalidate(queryClient);
    },
  });
}

// Edit (amount, description, category) or pause/resume. Resuming creates what's due from today on.
export function useSaveRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { error } = await supabase.from("recurring").update(fields).eq("id", id);
      if (error) throw error;
      if (fields.active) await syncRecurring().catch(() => {});
    },
    onSuccess: () => invalidate(queryClient),
  });
}

// Its movements stay (recurring_id -> null) and lose the marker
export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("recurring").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(queryClient),
  });
}
