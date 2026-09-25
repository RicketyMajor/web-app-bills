import { create } from "zustand";
import { supabase } from "../supabase/client";

// session: undefined = loading, null = signed out, object = signed in
export const useAuthStore = create(() => ({
  session: undefined,
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    }),
  signOut: () => supabase.auth.signOut(),
}));

// Single app-wide subscription; fires INITIAL_SESSION on load.
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session });
});
