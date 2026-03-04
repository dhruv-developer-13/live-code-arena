import { useState } from "react";
import {
  Trophy, Medal, Crown, TrendingUp, TrendingDown,
  Minus, Swords, Flame, Sun, Moon, User, Users, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TimeFilter = "all" | "month" | "week";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  streak: number;
  trend: "up" | "down" | "same";
  trendValue: number;
}

// ─── HARDCODED DATA (replace with DB query) ──────────────────────────────────
// TODO: const entries = await getLeaderboard({ filter: timeFilter })
// TODO: const myStats = await getMyRank(session.userId)

const ALL_TIME: LeaderboardEntry[] = [
  { rank: 1,  username: "AlgoMaster",    score: 12450, battlesWon: 156, totalBattles: 178, winRate: 87.6, streak: 12, trend: "same", trendValue: 0 },
  { rank: 2,  username: "CodeNinja99",   score: 11280, battlesWon: 142, totalBattles: 165, winRate: 86.1, streak: 8,  trend: "up",   trendValue: 2 },
  { rank: 3,  username: "ByteRunner",    score: 10890, battlesWon: 138, totalBattles: 162, winRate: 85.2, streak: 5,  trend: "up",   trendValue: 1 },
  { rank: 4,  username: "SyntaxWizard",  score: 9750,  battlesWon: 124, totalBattles: 150, winRate: 82.7, streak: 3,  trend: "down", trendValue: 2 },
  { rank: 5,  username: "DevLegend",     score: 9320,  battlesWon: 118, totalBattles: 145, winRate: 81.4, streak: 0,  trend: "up",   trendValue: 3 },
  { rank: 6,  username: "PixelCoder",    score: 8890,  battlesWon: 112, totalBattles: 140, winRate: 80.0, streak: 4,  trend: "same", trendValue: 0 },
  { rank: 7,  username: "BinaryBoss",    score: 8450,  battlesWon: 106, totalBattles: 135, winRate: 78.5, streak: 2,  trend: "down", trendValue: 1 },
  { rank: 8,  username: "LoopLord",      score: 8120,  battlesWon: 102, totalBattles: 132, winRate: 77.3, streak: 0,  trend: "up",   trendValue: 4 },
  { rank: 9,  username: "StackSolver",   score: 7890,  battlesWon: 98,  totalBattles: 128, winRate: 76.6, streak: 1,  trend: "same", trendValue: 0 },
  { rank: 10, username: "RecursiveKing", score: 7650,  battlesWon: 95,  totalBattles: 125, winRate: 76.0, streak: 0,  trend: "down", trendValue: 3 },
];

// TODO: swap per filter from API
const DATA_BY_FILTER: Record<TimeFilter, LeaderboardEntry[]> = {
  all:   ALL_TIME,
  month: ALL_TIME.map((e, i) => ({ ...e, rank: i + 1, score: Math.round(e.score * 0.3), battlesWon: Math.round(e.battlesWon * 0.25) })),
  week:  ALL_TIME.map((e, i) => ({ ...e, rank: i + 1, score: Math.round(e.score * 0.08), battlesWon: Math.round(e.battlesWon * 0.07) })),
};

const MY_STATS: LeaderboardEntry = {
  rank: 24, username: "aryan_dev", score: 4280,
  battlesWon: 47, totalBattles: 82, winRate: 57.3,
  streak: 4, trend: "up", trendValue: 5,
};

const PLATFORM_STATS = { totalPlayers: 1247, battlesThisWeek: 8432 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getRankDisplay(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground tabular-nums">#{rank}</span>;
}

function getRankRowStyle(rank: number) {
  if (rank === 1) return "bg-amber-500/6 border-l-2 border-l-amber-400/60";
  if (rank === 2) return "bg-slate-400/6 border-l-2 border-l-slate-400/40";
  if (rank === 3) return "bg-amber-600/6 border-l-2 border-l-amber-600/40";
  return "";
}

function Avatar({ username, size = "md" }: { username: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-base" : size === "md" ? "w-9 h-9 text-xs" : "w-7 h-7 text-xs";
  return (
    <div className={cn("rounded-full bg-muted border border-border flex items-center justify-center font-black text-foreground shrink-0", sz)}>
      {username === "aryan_dev" || username === "You"
        ? <User className="h-4 w-4 text-muted-foreground" />
        : username.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function TrendBadge({ trend, value }: { trend: "up" | "down" | "same"; value: number }) {
  if (trend === "same") return <Minus className="h-4 w-4 text-muted-foreground/50" />;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-bold tabular-nums",
      trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
    )}>
      {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {value}
    </span>
  );
}

function MyRankCard({ stats }: { stats: LeaderboardEntry }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Ranking</p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar username={stats.username} size="lg" />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div>
            <p className="font-bold text-foreground">@{stats.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-foreground tabular-nums">#{stats.rank}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ↑ {stats.trendValue} this week
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-center">
            <p className="text-xl font-black font-mono text-foreground tabular-nums">{stats.score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">points</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.battlesWon}</p>
            <p className="text-xs text-muted-foreground mt-0.5">wins</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-foreground tabular-nums">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">win rate</p>
          </div>
          {stats.streak > 0 && (
            <div className="text-center">
              <p className="text-xl font-black text-orange-500 flex items-center gap-1 tabular-nums">
                <Flame className="h-4 w-4" />{stats.streak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">streak</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const entries = DATA_BY_FILTER[timeFilter];
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <Header/>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Page Title ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Top coders ranked by total points</p>
          </div>
          <Trophy className="h-8 w-8 text-amber-400" />
        </div>

        {/* ── Platform Stats ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground tabular-nums">{PLATFORM_STATS.totalPlayers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Players</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground tabular-nums">{PLATFORM_STATS.battlesThisWeek.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Battles This Week</p>
            </div>
          </div>
        </div>

        {/* ── My Rank ──────────────────────────────────────────────────── */}
        <MyRankCard stats={MY_STATS} />

        {/* ── Filter tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
          {(["all", "month", "week"] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150",
                timeFilter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All Time" : f === "month" ? "This Month" : "This Week"}
            </button>
          ))}
        </div>

        {/* ── Podium Top 3 ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {/* 2nd place */}
          <div className="flex flex-col items-center gap-3 pt-6">
            <Avatar username={topThree[1].username} size="md" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{topThree[1].username}</p>
              <p className="text-xs text-muted-foreground font-mono tabular-nums">{topThree[1].score.toLocaleString()}</p>
            </div>
            <div className="w-full bg-slate-400/15 border border-slate-400/20 rounded-t-xl pt-3 pb-2 text-center">
              <Medal className="h-5 w-5 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-muted-foreground mt-1">#2</p>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar username={topThree[0].username} size="lg" />
              <Crown className="h-4 w-4 text-amber-400 absolute -top-2 left-1/2 -translate-x-1/2" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{topThree[0].username}</p>
              <p className="text-xs font-mono font-bold text-amber-500 tabular-nums">{topThree[0].score.toLocaleString()}</p>
            </div>
            <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-t-xl pt-4 pb-2 text-center">
              <Trophy className="h-5 w-5 text-amber-400 mx-auto" />
              <p className="text-xs font-bold text-amber-500 mt-1">#1</p>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center gap-3 pt-10">
            <Avatar username={topThree[2].username} size="md" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{topThree[2].username}</p>
              <p className="text-xs text-muted-foreground font-mono tabular-nums">{topThree[2].score.toLocaleString()}</p>
            </div>
            <div className="w-full bg-amber-600/10 border border-amber-600/20 rounded-t-xl pt-2 pb-2 text-center">
              <Medal className="h-5 w-5 text-amber-600 mx-auto" />
              <p className="text-xs font-bold text-muted-foreground mt-1">#3</p>
            </div>
          </div>
        </div>

        {/* ── Full Table (rank 4–10) ────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <div className="col-span-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rank</div>
            <div className="col-span-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Player</div>
            <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Score</div>
            <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Win Rate</div>
            <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Battles</div>
            <div className="col-span-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">±</div>
          </div>

          <div className="divide-y divide-border/50">
            {rest.map((entry, i) => (
              <div
                key={entry.username}
                className={cn(
                  "grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-muted/30 transition-colors",
                  getRankRowStyle(entry.rank)
                )}
              >
                {/* Rank */}
                <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                  {getRankDisplay(entry.rank)}
                </div>

                {/* Player */}
                <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar username={entry.username} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{entry.username}</p>
                    {entry.streak > 0 && (
                      <p className="text-xs text-orange-500 flex items-center gap-0.5 font-medium">
                        <Flame className="h-3 w-3" />{entry.streak} streak
                      </p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <p className="text-sm font-black font-mono text-foreground tabular-nums">{entry.score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground md:hidden">pts</p>
                </div>

                {/* Win Rate */}
                <div className="hidden md:flex md:col-span-2 flex-col items-center gap-1">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{entry.winRate}%</p>
                  <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${entry.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Battles */}
                <div className="hidden md:flex md:col-span-2 items-center justify-center gap-1.5 text-sm">
                  <Swords className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="font-bold text-foreground tabular-nums">{entry.battlesWon}</span>
                  <span className="text-muted-foreground">/ {entry.totalBattles}</span>
                </div>

                {/* Trend */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center">
                  <TrendBadge trend={entry.trend} value={entry.trendValue} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Rankings update every 30 minutes · Showing top 10 of {PLATFORM_STATS.totalPlayers.toLocaleString()} players
        </p>
      </main>
    </div>
  );
}