export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "codearena-theme";

// Single source of truth for light-mode design tokens.
export const LIGHT_THEME_TOKENS = {
  "--background": "oklch(0.985 0 0)",
  "--foreground": "oklch(0.19 0 0)",
  "--card": "oklch(0.995 0 0)",
  "--card-foreground": "oklch(0.19 0 0)",
  "--popover": "oklch(0.995 0 0)",
  "--popover-foreground": "oklch(0.19 0 0)",
  "--primary": "oklch(0.22 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.95 0 0)",
  "--secondary-foreground": "oklch(0.24 0 0)",
  "--muted": "oklch(0.95 0 0)",
  "--muted-foreground": "oklch(0.46 0 0)",
  "--accent": "oklch(0.95 0 0)",
  "--accent-foreground": "oklch(0.24 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--border": "oklch(0.9 0 0)",
  "--input": "oklch(0.9 0 0)",
  "--ring": "oklch(0.68 0 0)",
  "--chart-1": "oklch(0.646 0.222 41.116)",
  "--chart-2": "oklch(0.6 0.118 184.704)",
  "--chart-3": "oklch(0.398 0.07 227.392)",
  "--chart-4": "oklch(0.828 0.189 84.429)",
  "--chart-5": "oklch(0.769 0.188 70.08)",
  "--sidebar": "oklch(0.985 0 0)",
  "--sidebar-foreground": "oklch(0.19 0 0)",
  "--sidebar-primary": "oklch(0.22 0 0)",
  "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.95 0 0)",
  "--sidebar-accent-foreground": "oklch(0.24 0 0)",
  "--sidebar-border": "oklch(0.9 0 0)",
  "--sidebar-ring": "oklch(0.68 0 0)",
} as const;

export type ThemeTokenMap = typeof LIGHT_THEME_TOKENS;
