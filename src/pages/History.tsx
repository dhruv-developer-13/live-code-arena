import { Clock, Swords, ChevronRight, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { PageBackground } from "@/components/PageBackground";
import { historyApi } from "@/lib/api";
import type { RecentBattle } from "@/lib/api";

type FilterValue = "all" | "win" | "loss" | "Easy" | "Medium" | "Hard";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DIFF_STYLES = {
  Easy:   { badge: "bg-emerald-500/10 text-success border-emerald-500/20", bar: "bg-emerald-500" },
  Medium: { badge: "bg-amber-500/10 text-warning border-amber-500/20",         bar: "bg-amber-500"   },
  Hard:   { badge: "bg-rose-500/10 text-danger border-rose-500/20",             bar: "bg-rose-500"    },
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
    win:    "bg-emerald-500/15 text-success border-emerald-500/30",
    loss:   "bg-rose-500/15 text-danger border-rose-500/30",
    Easy:   "bg-emerald-500/15 text-success border-emerald-500/30",
    Medium: "bg-amber-500/15 text-warning border-amber-500/30",
    Hard:   "bg-rose-500/15 text-danger border-rose-500/30",
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
  battle: RecentBattle & { date: string };
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
            ? "bg-emerald-500/10 text-success border-emerald-500/20"
            : "bg-rose-500/10 text-danger border-rose-500/20"
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
            <span className={won ? "text-success" : "text-danger"}>
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

const defaultHistory = { battles: [] as RecentBattle[], stats: { totalBattles: 0, wins: 0, losses: 0, winRate: 0, avgScore: 0 } };

export default function History() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [history, setHistory] = useState(defaultHistory);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!initialized) setInitialized(true);
    const filter = activeFilter === "all" ? undefined : activeFilter;
    historyApi.getAll(filter).then(r => {
      if (r.data && !('error' in r.data)) {
        setHistory(r.data);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [activeFilter, initialized]);

  const historyData = history;
  const stats = historyData.stats || defaultHistory.stats;

  const filters: { label: string; value: FilterValue; count?: number }[] = [
    { label: "All",    value: "all"    },
    { label: "Wins",   value: "win",    count: stats.wins   },
    { label: "Losses", value: "loss",   count: stats.losses },
    { label: "Easy",   value: "Easy",   count: historyData.battles.filter(b => b.difficulty === "Easy").length   },
    { label: "Medium", value: "Medium", count: historyData.battles.filter(b => b.difficulty === "Medium").length },
    { label: "Hard",   value: "Hard",   count: historyData.battles.filter(b => b.difficulty === "Hard").length   },
  ];

  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return date.toLocaleDateString();
  };

  const battlesWithDate = (historyData?.battles || []).map(b => ({ ...b, date: formatDate(b.timestamp) }));
  const groups = battlesWithDate.reduce<{ date: string; battles: typeof battlesWithDate }[]>((acc, battle) => {
    const last = acc[acc.length - 1];
    if (last && last.date === battle.date) {
      last.battles.push(battle);
    } else {
      acc.push({ date: battle.date, battles: [battle] });
    }
    return acc;
  }, []);

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <PageBackground />
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

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
              <p className="text-xs text-muted-foreground mt-0.5">{stats.totalBattles} battles recorded</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold gap-1.5 border-emerald-500/30 text-success bg-emerald-500/8 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Battle History
          </Badge>
        </div>

        {/* ── Summary Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Battles" value={stats.totalBattles} color="text-foreground" />
          <StatCard label="Wins"          value={stats.wins}               color="text-success" />
          <StatCard label="Losses"        value={stats.losses}             color="text-danger" />
          <StatCard label="Win Rate"      value={`${stats.winRate}%`}      color="text-brand" />
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
                  {stats.wins}W
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {stats.losses}L
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span>Avg {stats.avgScore} pts</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-success font-semibold">{stats.winRate}% win rate</span>
              <span className="text-xs text-muted-foreground">{stats.totalBattles} battles</span>
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
            {battlesWithDate.length} result{battlesWithDate.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Battle List ──────────────────────────────────────── */}
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          {battlesWithDate.length === 0 ? (
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