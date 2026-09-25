import { create } from "zustand";
import { persist } from "zustand/middleware";

// First visit follows the OS preference; after that the saved choice wins.
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: prefersDark ? "dark" : "light",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "theme" }
  )
);
