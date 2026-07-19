import { useEffect } from "react";
import { useTheme } from "@/states/themeState";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return <>{children}</>;
}
