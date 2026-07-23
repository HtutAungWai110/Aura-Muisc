import { create } from "zustand";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const getInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
};

export const useTheme = create<ThemeState>()((set) => ({
  mode: getInitialMode(),
  toggleTheme: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme-mode", next);
      return { mode: next };
    }),
}));
