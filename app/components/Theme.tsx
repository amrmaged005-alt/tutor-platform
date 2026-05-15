"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial value is read from <html data-theme="..."> which the inline init
  // script in layout.tsx sets before hydration to avoid flash-of-wrong-theme.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
  });

  const apply = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
      try { localStorage.setItem("coursaty-theme", t); } catch {}
    }
  }, []);

  // Mirror system preference changes only when the user hasn't picked one
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = (() => { try { return localStorage.getItem("coursaty-theme"); } catch { return null; }})();
    if (stored) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [apply]);

  const toggle = useCallback(() => apply(theme === "dark" ? "light" : "dark"), [theme, apply]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
