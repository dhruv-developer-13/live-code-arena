import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LIGHT_THEME_TOKENS, THEME_STORAGE_KEY, type AppTheme } from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): AppTheme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyLightTokens(root: HTMLElement) {
  for (const [token, value] of Object.entries(LIGHT_THEME_TOKENS)) {
    root.style.setProperty(token, value);
  }
}

function clearLightTokens(root: HTMLElement) {
  for (const token of Object.keys(LIGHT_THEME_TOKENS)) {
    root.style.removeProperty(token);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => getInitialTheme());

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      clearLightTokens(root);
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      applyLightTokens(root);
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
