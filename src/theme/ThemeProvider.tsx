import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { THEME_TOKENS, THEME_STORAGE_KEY, type AppTheme } from "./theme";
import { ThemeContext, type ThemeContextValue } from "./ThemeContext";

function getInitialTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const storedTheme = globalThis.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyThemeTokens(root: HTMLElement, theme: AppTheme) {
  Object.entries(THEME_TOKENS[theme]).forEach(([token, value]) => {
  root.style.setProperty(token, value);
});
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme());

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    applyThemeTokens(root, theme);

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
