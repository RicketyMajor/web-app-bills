import { create } from "zustand";
import { persist } from "zustand/middleware";

// mode = the user's choice; theme = what's applied. "system" follows the OS live.
const media = window.matchMedia("(prefers-color-scheme: dark)");
const resolve = (mode) => (mode === "system" ? (media.matches ? "dark" : "light") : mode);

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: "system",
      theme: resolve("system"),
      setMode: (mode) => set({ mode, theme: resolve(mode) }),
      toggleTheme: () => get().setMode(get().theme === "light" ? "dark" : "light"),
    }),
    {
      name: "theme",
      version: 1,
      partialize: (s) => ({ mode: s.mode }),
      // v0 stored { theme }: that explicit choice becomes the mode
      migrate: (old) => ({ mode: old?.theme ?? "system" }),
      merge: (saved, current) => {
        const mode = saved?.mode ?? current.mode;
        return { ...current, mode, theme: resolve(mode) };
      },
    }
  )
);

media.addEventListener("change", () => {
  if (useThemeStore.getState().mode === "system") useThemeStore.setState({ theme: resolve("system") });
});
