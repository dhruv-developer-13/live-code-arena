import { useEffect, useState } from "react";
import { Trophy, Swords, Target, TrendingUp, Clock, ChevronRight, CheckCircle2, XCircle, ArrowUpRight, BarChart3, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { CreateJoinRoom } from "@/components/CreateJoinRoom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageBackground } from "@/components/PageBackground";
import { userApi } from "@/lib/api";
import type { UserStats, RecentBattle } from "@/lib/api";

//  SUBCOMPONENTS 

function StatCard({ icon: Icon, label, value, sub, accent, trend }: {
  icon: any; label: string; value: string | number; sub?: string; accent: string; trend?: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 hover:border-border transition-colors duration-200 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2 rounded-xl", accent)}>
            <Icon className="h-4 w-4" />
          </div>
          {trend && (
            <span className="text-xs text-success font-medium flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />{trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/50 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const DIFF_STYLES = {
  Easy:   "bg-emerald-500/10 text-success border-emerald-500/20",
  Medium: "bg-amber-500/10 text-warning border-amber-500/20",
  Hard:   "bg-rose-500/10 text-danger border-rose-500/20",
} as const;

function BattleRow({ battle }: { battle: RecentBattle }) {
  const won = battle.result === "win";
  return (
    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group cursor-default">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Result indicator */}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border",
          won
            ? "bg-emerald-500/10 text-success border-emerald-500/20"
            : "bg-rose-500/10 text-danger border-rose-500/20"
        )}>
          {won ? "W" : "L"}
        </div>

        {/* Opponent info */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">vs {battle.opponent}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn(
              "inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-semibold border",
              DIFF_STYLES[battle.difficulty as keyof typeof DIFF_STYLES]
            )}>
              {battle.difficulty}
            </span>
            <span className="text-xs text-muted-foreground/60">{battle.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        {/* Score */}
        <div className="text-right">
          <p className="text-sm font-bold font-mono tabular-nums">
            <span className={won ? "text-success" : "text-danger"}>
              {battle.myScore}
            </span>
            <span className="text-muted-foreground/40 mx-1.5 text-xs">·</span>
            <span className="text-muted-foreground">{battle.theirScore}</span>
          </p>
          <p className="text-xs text-muted-foreground/50 flex items-center justify-end gap-1 mt-0.5">
            <Clock className="h-2.5 w-2.5" />{battle.duration}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
      </div>
    </div>
  );
}

//  MAIN COMPONENT 

const defaultStats: UserStats = { battlesWon: 0, totalBattles: 0, winRate: 0, avgScore: 0, totalPoints: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [recentBattles, setRecentBattles] = useState<RecentBattle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getStats(),
      userApi.getRecentBattles()
    ]).then(([statsRes, battlesRes]) => {
      if (statsRes.data) setStats(statsRes.data);
      if (battlesRes.data) setRecentBattles(battlesRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const userName    = user?.username || "Player";
  const userAvatar  = null;
  const userInitial = userName[0]?.toUpperCase() ?? "P";

  const statsData = stats;
  const battlesData = recentBattles;

  const wins = battlesData.filter(b => b.result === "win").length;
  const losses = battlesData.length - wins;
  const avgDuration = battlesData.length > 0
    ? Math.round(battlesData.reduce((a, b) => a + parseInt(b.duration), 0) / battlesData.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <PageBackground />
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
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

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/*  Hero Row  */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-border">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
              <AvatarFallback className="bg-emerald-500/10 text-success font-bold text-lg">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Welcome back</p>
              <h1 className="text-xl font-bold tracking-tight">{userName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 h-5 gap-1 border-amber-500/30 text-warning bg-amber-500/8">
                  <Trophy className="h-2.5 w-2.5" />
                  Gold II
                </Badge>
                <span className="text-xs text-muted-foreground">Top 12% of all players</span>
              </div>
            </div>
          </div>
        </div>

        {/*  Stats Grid  */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Trophy}     label="Battles Won"   value={statsData.battlesWon}        accent="bg-emerald-500/10 text-success" />
          <StatCard icon={Swords}     label="Total Battles" value={statsData.totalBattles}       accent="bg-blue-500/10 text-info" />
          <StatCard icon={Target}     label="Win Rate"      value={`${statsData.winRate}%`}      accent="bg-violet-500/10 text-brand" />
          <StatCard icon={TrendingUp} label="Avg Score"     value={statsData.avgScore} sub="per match" accent="bg-amber-500/10 text-warning" />
          <StatCard icon={Zap}        label="Total Points" value={statsData.totalPoints}  accent="bg-orange-500/10 text-highlight" />
        </div>

        {/*  Season Performance  */}
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Season Performance</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {statsData.battlesWon}W
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  {statsData.totalBattles - statsData.battlesWon}L
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${statsData.winRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-success font-semibold">{statsData.winRate}% win rate</span>
              <span className="text-xs text-muted-foreground">{statsData.totalBattles} total</span>
            </div>
          </CardContent>
        </Card>

        {/*  Main 2-col  */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left: 2/3 width */}
          <div className="lg:col-span-2 space-y-5">

            {/* Start a Battle */}
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Swords className="h-4 w-4 text-muted-foreground" />
                  Start a Battle
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <CreateJoinRoom />
              </CardContent>
            </Card>

            {/* Recent Battles */}
            <Card className="rounded-2xl border-border/60 overflow-hidden">
              <CardHeader className="px-5 py-3.5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Recent Battles
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {wins}/{battlesData.length} won
                    </span>
                    <button
                      onClick={() => navigate("/history")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-0.5"
                    >
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
{battlesData.map(battle => (
                     <BattleRow key={battle.id} battle={battle} />
                   ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: 1/3 width */}
          <div className="space-y-4">

            {/* Last 5 snapshot */}
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Last 5 Battles
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                {/* W/L bar */}
                <div className="flex gap-1.5">
{battlesData.map(b => (
                     <div
                       key={b.id}
                       title={`vs ${b.opponent} — ${b.result === "win" ? "W" : "L"}`}
                      className={cn(
                        "flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                        b.result === "win"
                          ? "bg-emerald-500/15 text-success"
                          : "bg-rose-500/15 text-danger"
                      )}
                    >
                      {b.result === "win" ? "W" : "L"}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Quick stats */}
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-muted-foreground">Wins</span>
                    <span className="text-xs font-bold text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />{wins}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-muted-foreground">Losses</span>
                    <span className="text-xs font-bold text-danger flex items-center gap-1">
                      <XCircle className="h-3 w-3" />{losses}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-muted-foreground">Avg duration</span>
                    <span className="text-xs font-bold font-mono">{avgDuration}m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Mix */}
            <Card className="rounded-2xl border-border/60">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Difficulty Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-3.5">
                {(["Easy", "Medium", "Hard"] as const).map(diff => {
                  const count = battlesData.filter(b => b.difficulty === diff).length;
                  const pct   = Math.round((count / battlesData.length) * 100);
                  const color = {
                    Easy:   "bg-emerald-500",
                    Medium: "bg-amber-500",
                    Hard:   "bg-rose-500",
                  }[diff];
                  const label = {
                    Easy:   "text-success",
                    Medium: "text-warning",
                    Hard:   "text-danger",
                  }[diff];
                  return (
                    <div key={diff}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={cn("text-xs font-semibold", label)}>{diff}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{count} / {battlesData.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="rounded-2xl border-border/60">
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() => navigate("/history")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group text-left"
                >
                  <span className="text-sm font-medium text-foreground">Battle History</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </button>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group text-left"
                >
                  <span className="text-sm font-medium text-foreground">Leaderboard</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </button>
                <button
                  onClick={() => navigate("/battle-room")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/8 hover:bg-emerald-500/15 border border-emerald-500/20 transition-colors group text-left"
                >
                  <span className="text-sm font-semibold text-success">New Battle</span>
                  <Swords className="h-4 w-4 text-emerald-500/60 group-hover:text-emerald-500 transition-colors" />
                </button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
