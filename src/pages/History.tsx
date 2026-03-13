import { Trophy, Clock, Swords, ChevronRight, CheckCircle2, XCircle, Filter } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";

// TODO: fetch from /api/battles?userId=...
const ALL_BATTLES = [
  { id: "1",  opponent: "CodeMaster99", result: "win"  as const, myScore: 350, theirScore: 280, duration: "28m", timestamp: "2 hours ago",  date: "Today",      difficulty: "Medium" },
  { id: "2",  opponent: "AlgoNinja",    result: "loss" as const, myScore: 200, theirScore: 320, duration: "35m", timestamp: "5 hours ago",  date: "Today",      difficulty: "Hard"   },
  { id: "3",  opponent: "ByteRunner",   result: "win"  as const, myScore: 400, theirScore: 150, duration: "19m", timestamp: "Yesterday",    date: "Yesterday",  difficulty: "Easy"   },
  { id: "4",  opponent: "PixelDev",     result: "win"  as const, myScore: 280, theirScore: 270, duration: "41m", timestamp: "Yesterday",    date: "Yesterday",  difficulty: "Medium" },
  { id: "5",  opponent: "SyntaxSam",    result: "loss" as const, myScore: 180, theirScore: 350, duration: "44m", timestamp: "2 days ago",   date: "2 days ago", difficulty: "Hard"   },
  { id: "6",  opponent: "DevStorm",     result: "win"  as const, myScore: 320, theirScore: 210, duration: "31m", timestamp: "3 days ago",   date: "3 days ago", difficulty: "Medium" },
  { id: "7",  opponent: "NullPointer",  result: "win"  as const, myScore: 290, theirScore: 180, duration: "27m", timestamp: "3 days ago",   date: "3 days ago", difficulty: "Easy"   },
  { id: "8",  opponent: "StackTrace",   result: "loss" as const, myScore: 150, theirScore: 400, duration: "43m", timestamp: "4 days ago",   date: "4 days ago", difficulty: "Hard"   },
  { id: "9",  opponent: "BitShifter",   result: "win"  as const, myScore: 370, theirScore: 290, duration: "33m", timestamp: "5 days ago",   date: "5 days ago", difficulty: "Medium" },
  { id: "10", opponent: "RecursionKid", result: "loss" as const, myScore: 220, theirScore: 310, duration: "38m", timestamp: "1 week ago",   date: "1 week ago", difficulty: "Hard"   },
  { id: "11", opponent: "HashMapHero",  result: "win"  as const, myScore: 410, theirScore: 200, duration: "22m", timestamp: "1 week ago",   date: "1 week ago", difficulty: "Easy"   },
  { id: "12", opponent: "O1Optimizer",  result: "win"  as const, myScore: 300, theirScore: 250, duration: "36m", timestamp: "2 weeks ago",  date: "2 weeks ago",difficulty: "Medium" },
];

type Filter = "all" | "win" | "loss" | "Easy" | "Medium" | "Hard";

export default function BattleHistory() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filtered = ALL_BATTLES.filter((b) => {
    if (activeFilter === "win" || activeFilter === "loss") return b.result === activeFilter;
    if (["Easy", "Medium", "Hard"].includes(activeFilter)) return b.difficulty === activeFilter;
    return true;
  });

  const wins   = ALL_BATTLES.filter((b) => b.result === "win").length;
  const losses = ALL_BATTLES.length - wins;
  const winRate = Math.round((wins / ALL_BATTLES.length) * 100);
  const avgScore = Math.round(ALL_BATTLES.reduce((a, b) => a + b.myScore, 0) / ALL_BATTLES.length);

  const filters: { label: string; value: Filter }[] = [
    { label: "All",    value: "all"    },
    { label: "Wins",   value: "win"    },
    { label: "Losses", value: "loss"   },
    { label: "Easy",   value: "Easy"   },
    { label: "Medium", value: "Medium" },
    { label: "Hard",   value: "Hard"   },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Swords className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Battle History</h1>
            <p className="text-sm text-muted-foreground">{ALL_BATTLES.length} battles played</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Battles", value: ALL_BATTLES.length, color: "text-foreground" },
            { label: "Wins",          value: wins,               color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Losses",        value: losses,             color: "text-rose-600 dark:text-rose-400" },
            { label: "Win Rate",      value: `${winRate}%`,      color: "text-violet-600 dark:text-violet-400" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="rounded-2xl">
              <CardContent className="p-5">
                <p className={cn("text-2xl font-black", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {filters.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                activeFilter === value
                  ? value === "win"    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : value === "loss"   ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : value === "Easy"   ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : value === "Medium" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : value === "Hard"   ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-muted text-foreground border-border"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted/60"
              )}
            >
              {label}
              {value !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {value === "win"    ? wins
                  : value === "loss"  ? losses
                  : ALL_BATTLES.filter((b) => b.difficulty === value).length}
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
        </div>

        {/* Battle list */}
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Swords className="h-8 w-8 opacity-30" />
                <p className="text-sm">No battles found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filtered.map((battle, i) => {
                  const won = battle.result === "win";
                  const isNewDate = i === 0 || filtered[i - 1].date !== battle.date;
                  return (
                    <div key={battle.id}>
                      {/* Date separator */}
                      {isNewDate && (
                        <div className="px-5 py-2 bg-muted/30 border-b border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground">{battle.date}</p>
                        </div>
                      )}
                      {/* Battle row */}
                      <div className="flex items-center justify-between py-3.5 px-5 hover:bg-muted/40 transition-colors group cursor-default">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black",
                            won ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          )}>
                            {won ? "W" : "L"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">vs {battle.opponent}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded font-medium",
                                battle.difficulty === "Easy"   && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                battle.difficulty === "Medium" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                battle.difficulty === "Hard"   && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                              )}>
                                {battle.difficulty}
                              </span>
                              <span className="text-xs text-muted-foreground">{battle.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 ml-3">
                          <div className="text-right">
                            <p className="text-sm font-bold font-mono">
                              <span className={won ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                {battle.myScore}
                              </span>
                              <span className="text-muted-foreground mx-1">—</span>
                              {battle.theirScore}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />{battle.duration}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}