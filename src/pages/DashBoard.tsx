import { useState } from "react";
import { Trophy, Swords, Target, TrendingUp, Clock, Flame, Plus, LogIn, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { CreateJoinRoom } from "@/components/CreateJoinRoom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

const STATS = {
  battlesWon: 47,
  totalBattles: 82,
  winRate: 57,
  currentStreak: 4,
  bestStreak: 11,
  avgScore: 310,
};

// TODO: fetch from /api/battles?userId=...&limit=5
const RECENT_BATTLES = [
  { id: "1", opponent: "CodeMaster99", result: "win" as const, myScore: 350, theirScore: 280, duration: "28m", timestamp: "2 hours ago", difficulty: "Medium" },
  { id: "2", opponent: "AlgoNinja", result: "loss" as const, myScore: 200, theirScore: 320, duration: "35m", timestamp: "5 hours ago", difficulty: "Hard" },
  { id: "3", opponent: "ByteRunner", result: "win" as const, myScore: 400, theirScore: 150, duration: "19m", timestamp: "Yesterday", difficulty: "Easy" },
  { id: "4", opponent: "PixelDev", result: "win" as const, myScore: 280, theirScore: 270, duration: "41m", timestamp: "Yesterday", difficulty: "Medium" },
  { id: "5", opponent: "SyntaxSam", result: "loss" as const, myScore: 180, theirScore: 350, duration: "44m", timestamp: "2 days ago", difficulty: "Hard" },
];

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

// Shared card used for: StatTile, Last 5 Battles, Difficulty Mix, Season Performance, Start a Battle, Recent Battles
function StatTile({ icon: Icon, label, value, sub, accent }: {
  icon: any; label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <Card className="group rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-5">
        <div className={cn("inline-flex p-2 rounded-lg mb-3", accent)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BattleRow({ battle }: { battle: typeof RECENT_BATTLES[0] }) {
  const won = battle.result === "win";
  return (
    <div className="flex items-center justify-between py-3.5 px-4 hover:bg-muted/40 transition-colors group cursor-default">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black",
          won ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
        )}>
          {won ? "W" : "L"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{battle.opponent}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              battle.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              battle.difficulty === "Medium" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              battle.difficulty === "Hard" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            )}>
              {battle.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">{battle.timestamp}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-3">
        <div className="text-right">
          <p className="text-sm font-bold font-mono text-foreground">
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
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Index() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const USER = {
    name: user?.fullName || user?.username || "Unknown Player",
    username: user?.username || "unknown",
    avatar: user?.imageUrl || null,
    rank: "Gold II",
    rankPercentile: 12,
  };

  const wins = RECENT_BATTLES.filter((b) => b.result === "win").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Welcome Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Welcome back</p>
            {/* TODO: replace with user.name from DB */}
            <h1 className="text-3xl font-black tracking-tight text-foreground">{USER.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Trophy className="h-3 w-3" />
                {USER.rank}
              </span>
              <span className="text-xs text-muted-foreground">Top {USER.rankPercentile}% of all players</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-500/8 border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-lg font-black text-foreground leading-none">{STATS.currentStreak}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid — all 5 use StatTile → Card ───────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatTile icon={Trophy} label="Battles Won" value={STATS.battlesWon} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
          <StatTile icon={Swords} label="Total Battles" value={STATS.totalBattles} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <StatTile icon={Target} label="Win Rate" value={`${STATS.winRate}%`} accent="bg-violet-500/10 text-violet-600 dark:text-violet-400" />
          <StatTile icon={TrendingUp} label="Avg Score" value={STATS.avgScore} sub="per match" accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <StatTile icon={Flame} label="Best Streak" value={STATS.bestStreak} sub="days" accent="bg-orange-500/10 text-orange-600 dark:text-orange-400" />
        </div>

        {/* ── Season Performance — Card ─────────────────────────────────── */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Season Performance</p>
              <p className="text-xs text-muted-foreground">{STATS.battlesWon}W — {STATS.totalBattles - STATS.battlesWon}L</p>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${STATS.winRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{STATS.winRate}% win rate</span>
              <span className="text-xs text-muted-foreground">{STATS.totalBattles} battles played</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Main 2-col layout ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">

            {/* Start a Battle — Card */}
            <Card className="rounded-2xl">
              <CardContent className="px-6 pb-6 pt-0">
                <CreateJoinRoom />
              </CardContent>
            </Card>

            {/* Recent Battles — Card with flush header */}
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Recent Battles</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{wins}/{RECENT_BATTLES.length} won</span>
                    <button
                      onClick={() => navigate("/history")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      View all →
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {RECENT_BATTLES.map((battle) => (
                    <BattleRow key={battle.id} battle={battle} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right col */}
          <div className="space-y-4">

            {/* Last 5 Battles — Card */}
            <Card className="rounded-2xl">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle className="text-sm font-bold">Last 5 Battles</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-4 space-y-4">
                <div className="flex gap-1.5">
                  {RECENT_BATTLES.map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        "flex-1 h-7 rounded-md flex items-center justify-center text-xs font-black",
                        b.result === "win"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {b.result === "win" ? "W" : "L"}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-border/50">
                  <div className="flex justify-between text-sm py-2.5">
                    <span className="text-muted-foreground">Wins</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />{wins}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2.5">
                    <span className="text-muted-foreground">Losses</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />{RECENT_BATTLES.length - wins}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2.5">
                    <span className="text-muted-foreground">Avg duration</span>
                    <span className="font-bold text-foreground font-mono">
                      {Math.round(RECENT_BATTLES.reduce((a, b) => a + parseInt(b.duration), 0) / RECENT_BATTLES.length)}m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Mix — Card */}
            <Card className="rounded-2xl">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle className="text-sm font-bold">Difficulty Mix</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                  const count = RECENT_BATTLES.filter((b) => b.difficulty === diff).length;
                  const pct = Math.round((count / RECENT_BATTLES.length) * 100);
                  return (
                    <div key={diff} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={cn(
                          "font-semibold",
                          diff === "Easy" && "text-emerald-600 dark:text-emerald-400",
                          diff === "Medium" && "text-amber-600 dark:text-amber-400",
                          diff === "Hard" && "text-rose-600 dark:text-rose-400",
                        )}>{diff}</span>
                        <span className="text-muted-foreground">{count} battles</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            diff === "Easy" && "bg-emerald-500",
                            diff === "Medium" && "bg-amber-500",
                            diff === "Hard" && "bg-rose-500",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}