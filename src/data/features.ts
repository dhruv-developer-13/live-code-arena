import type { LucideIcon } from "lucide-react";
import { Swords, Shield, Clock, Trophy, Code2, Zap } from "lucide-react";

export type AccentColor = "emerald" | "rose" | "amber" | "blue" | "violet" | "orange";

export interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: AccentColor;
}

export const FEATURES: Feature[] = [
  {
    icon: Swords,
    title: "1v1 Live Battles",
    desc: "Real-time competitive coding against opponents of your skill level. Watch each other's scores update live.",
    accent: "emerald",
  },
  {
    icon: Shield,
    title: "Anti-Cheat Engine",
    desc: "Fullscreen enforcement, tab-switch detection, clipboard blocking. Every battle is fair and monitored.",
    accent: "rose",
  },
  {
    icon: Clock,
    title: "45-Minute Format",
    desc: "Three problems — Easy, Medium, Hard. Time pressure separates fast thinkers from the rest.",
    accent: "amber",
  },
  {
    icon: Trophy,
    title: "Ranked Leaderboard",
    desc: "Global rankings updated after every match. Climb from Bronze to Grandmaster with a transparent ELO system.",
    accent: "blue",
  },
  {
    icon: Code2,
    title: "Python 3 Native",
    desc: "Write clean Python directly in the browser with syntax highlighting, tab indentation, and instant feedback.",
    accent: "violet",
  },
  {
    icon: Zap,
    title: "Live Score Feed",
    desc: "See your opponent's score update in real-time via WebSocket. Know exactly where you stand at all times.",
    accent: "orange",
  },
];
