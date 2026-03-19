import type { LucideIcon } from "lucide-react";
import { Terminal, Users, Cpu, TrendingUp } from "lucide-react";

export interface Step {
  n: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const STEPS: Step[] = [
  {
    n: "01",
    title: "Create or Join a Room",
    desc: "Generate a unique room code and share it with your opponent, or paste one you received.",
    icon: Terminal,
  },
  {
    n: "02",
    title: "Both Players Ready Up",
    desc: "Once both players hit Ready in the Waiting Room, the arena launches simultaneously for both.",
    icon: Users,
  },
  {
    n: "03",
    title: "Code Under Pressure",
    desc: "45 minutes. 3 problems. Full-screen locked. No copy-paste. Pure skill.",
    icon: Cpu,
  },
  {
    n: "04",
    title: "Results & Rankings",
    desc: "Detailed breakdown per problem, score comparison, and immediate leaderboard update.",
    icon: TrendingUp,
  },
];
