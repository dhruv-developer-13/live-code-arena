import { Clock, Swords, ChevronRight, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { PageBackground } from "@/components/PageBackground";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// TODO: fetch from /api/battles?userId=...

const ALL_BATTLES = [
  { id: "1",  opponent: "CodeMaster99", result: "win"  as const, myScore: 350, theirScore: 280, duration: "28m", timestamp: "2 hours ago",  date: "Today",       difficulty: "Medium" },
  { id: "2",  opponent: "AlgoNinja",    result: "loss" as const, myScore: 200, theirScore: 320, duration: "35m", timestamp: "5 hours ago",  date: "Today",       difficulty: "Hard"   },
  { id: "3",  opponent: "ByteRunner",   result: "win"  as const, myScore: 400, theirScore: 150, duration: "19m", timestamp: "Yesterday",    date: "Yesterday",   difficulty: "Easy"   },
  { id: "4",  opponent: "PixelDev",     result: "win"  as const, myScore: 280, theirScore: 270, duration: "41m", timestamp: "Yesterday",    date: "Yesterday",   difficulty: "Medium" },
  { id: "5",  opponent: "SyntaxSam",    result: "loss" as const, myScore: 180, theirScore: 350, duration: "44m", timestamp: "2 days ago",   date: "2 days ago",  difficulty: "Hard"   },
  { id: "6",  opponent: "DevStorm",     result: "win"  as const, myScore: 320, theirScore: 210, duration: "31m", timestamp: "3 days ago",   date: "3 days ago",  difficulty: "Medium" },
  { id: "7",  opponent: "NullPointer",  result: "win"  as const, myScore: 290, theirScore: 180, duration: "27m", timestamp: "3 days ago",   date: "3 days ago",  difficulty: "Easy"   },
  { id: "8",  opponent: "StackTrace",   result: "loss" as const, myScore: 150, theirScore: 400, duration: "43m", timestamp: "4 days ago",   date: "4 days ago",  difficulty: "Hard"   },
  { id: "9",  opponent: "BitShifter",   result: "win"  as const, myScore: 370, theirScore: 290, duration: "33m", timestamp: "5 days ago",   date: "5 days ago",  difficulty: "Medium" },
  { id: "10", opponent: "RecursionKid", result: "loss" as const, myScore: 220, theirScore: 310, duration: "38m", timestamp: "1 week ago",   date: "1 week ago",  difficulty: "Hard"   },
  { id: "11", opponent: "HashMapHero",  result: "win"  as const, myScore: 410, theirScore: 200, duration: "22m", timestamp: "1 week ago",   date: "1 week ago",  difficulty: "Easy"   },
  { id: "12", opponent: "O1Optimizer",  result: "win"  as const, myScore: 300, theirScore: 250, duration: "36m", timestamp: "2 weeks ago",  date: "2 weeks ago", difficulty: "Medium" },
];

type FilterValue = "all" | "win" | "loss" | "Easy" | "Medium" | "Hard";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DIFF_STYLES = {
  Easy:   { badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500" },
  Medium: { badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",         bar: "bg-amber-500"   },
  Hard:   { badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",             bar: "bg-rose-500"    },
} as const;

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card className="rounded-2xl border-border/60">
      <CardContent className="p-5">
        <p className={cn("text-2xl font-bold tabular-nums tracking-tight", color)}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

interface FilterPillProps {
  label: string;
  value: FilterValue;
  active: boolean;
  count?: number;
  onClick: () => void;
}

function FilterPill({ label, value, active, count, onClick }: FilterPillProps) {
  const activeStyles: Record<string, string> = {
    all:    "bg-foreground text-background border-foreground",
    win:    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    loss:   "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Easy:   "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Hard:   "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
        active
          ? activeStyles[value]
          : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("opacity-50 tabular-nums", active && "opacity-70")}>{count}</span>
      )}
    </button>
  );
}

interface BattleRowProps {
  battle: typeof ALL_BATTLES[0];
}

function BattleRow({ battle }: BattleRowProps) {
  const won = battle.result === "win";
  const diff = battle.difficulty as keyof typeof DIFF_STYLES;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/25 transition-colors group cursor-default">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Result badge */}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border",
          won
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
        )}>
          {won ? "W" : "L"}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            vs <span className="text-foreground">{battle.opponent}</span>
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-md font-semibold border",
              DIFF_STYLES[diff].badge
            )}>
              {battle.difficulty}
            </span>
            <span className="text-xs text-muted-foreground/60">{battle.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-3">
        <div className="text-right">
          <p className="text-sm font-bold font-mono tabular-nums">
            <span className={won ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {battle.myScore}
            </span>
            <span className="text-muted-foreground/40 mx-1.5 text-xs">·</span>
            <span className="text-muted-foreground">{battle.theirScore}</span>
          </p>
          <p className="text-xs text-muted-foreground/50 flex items-center justify-end gap-1 mt-0.5">
            <Clock className="h-2.5 w-2.5" />
            {battle.duration}
          </p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function History() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filtered = ALL_BATTLES.filter(b => {
    if (activeFilter === "win" || activeFilter === "loss") return b.result === activeFilter;
    if (["Easy", "Medium", "Hard"].includes(activeFilter)) return b.difficulty === activeFilter;
    return true;
  });

  const wins     = ALL_BATTLES.filter(b => b.result === "win").length;
  const losses   = ALL_BATTLES.length - wins;
  const winRate  = Math.round((wins / ALL_BATTLES.length) * 100);
  const avgScore = Math.round(ALL_BATTLES.reduce((a, b) => a + b.myScore, 0) / ALL_BATTLES.length);

  const filters: { label: string; value: FilterValue; count?: number }[] = [
    { label: "All",    value: "all"    },
    { label: "Wins",   value: "win",    count: wins   },
    { label: "Losses", value: "loss",   count: losses },
    { label: "Easy",   value: "Easy",   count: ALL_BATTLES.filter(b => b.difficulty === "Easy").length   },
    { label: "Medium", value: "Medium", count: ALL_BATTLES.filter(b => b.difficulty === "Medium").length },
    { label: "Hard",   value: "Hard",   count: ALL_BATTLES.filter(b => b.difficulty === "Hard").length   },
  ];

  // Group filtered battles by date
  const groups = filtered.reduce<{ date: string; battles: typeof ALL_BATTLES }[]>((acc, battle) => {
    const last = acc[acc.length - 1];
    if (last && last.date === battle.date) {
      last.battles.push(battle);
    } else {
      acc.push({ date: battle.date, battles: [battle] });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBackground />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Swords className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Battle History</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{ALL_BATTLES.length} battles recorded</p>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Battles" value={ALL_BATTLES.length} color="text-foreground" />
          <StatCard label="Wins"          value={wins}               color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Losses"        value={losses}             color="text-rose-600 dark:text-rose-400" />
          <StatCard label="Win Rate"      value={`${winRate}%`}      color="text-violet-600 dark:text-violet-400" />
        </div>

        {/* ── Win Rate Bar ─────────────────────────────────────── */}
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Season Overview
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {wins}W
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {losses}L
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span>Avg {avgScore} pts</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{winRate}% win rate</span>
              <span className="text-xs text-muted-foreground">{ALL_BATTLES.length} battles</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Filters ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          {filters.map(f => (
            <FilterPill
              key={f.value}
              label={f.label}
              value={f.value}
              active={activeFilter === f.value}
              count={f.count}
              onClick={() => setActiveFilter(f.value)}
            />
          ))}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Battle List ──────────────────────────────────────── */}
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          {filtered.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Swords className="h-5 w-5 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No battles found</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Try a different filter</p>
              </div>
            </CardContent>
          ) : (
            <div>
              {groups.map((group, gi) => (
                <div key={group.date}>
                  {/* Date group header */}
                  <div className={cn(
                    "px-5 py-2 flex items-center gap-3",
                    gi === 0 ? "bg-muted/20" : "bg-muted/10 border-t border-border/40"
                  )}>
                    <p className="text-xs font-semibold text-muted-foreground">{group.date}</p>
                    <div className="flex-1 h-px bg-border/40" />
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                      {group.battles.length} battle{group.battles.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Battles in this group */}
                  <div className="divide-y divide-border/30">
                    {group.battles.map(battle => (
                      <BattleRow key={battle.id} battle={battle} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </main>
    </div>
  );
}