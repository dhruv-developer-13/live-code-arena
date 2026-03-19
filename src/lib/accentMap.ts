import type { AccentColor } from "@/data/features";

/**
 * Static mapping of accent colors to Tailwind classes.
 * Replaces dynamic class generation like bg-${accent}-500/10
 * Enables proper tree-shaking and build optimization.
 */
export const accentMap: Record<AccentColor, { bg: string; border: string; text: string; light: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    light: "bg-emerald-500/5",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    light: "bg-rose-500/5",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    light: "bg-amber-500/5",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    light: "bg-blue-500/5",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    light: "bg-violet-500/5",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
    light: "bg-orange-500/5",
  },
};

export const formatTime = (seconds: number): string => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};
