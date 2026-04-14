import { useState, useEffect } from "react";
import {
  Trophy, Medal, Crown,
  Swords, Flame, User, Users, Zap, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { PageBackground } from "@/components/PageBackground";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboardApi } from "@/lib/api";
import type { LeaderboardEntry, LeaderboardStats, MyRank } from "@/lib/api";

type TimeFilter = "all" | "month" | "week";

//  HELPERS 

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
      {username === "You" ? <User className="h-4 w-4 text-muted-foreground" /> : username.slice(0, 2).toUpperCase()}
    </div>
  );
}

//  SUBCOMPONENTS 

function MyRankCard({ stats }: { stats: MyRank }) {
  return (
    <Card className="rounded-2xl p-5 sm:p-6 gap-0 py-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">Your Ranking</p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar username={stats.username} size="lg" />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-success" />
            </span>
          </div>
          <div>
            <p className="font-bold text-foreground">@{stats.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-foreground tabular-nums">#{stats.rank}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 w-full sm:w-auto sm:flex sm:items-center sm:gap-8">
          <div className="text-center">
            <p className="text-xl font-black font-mono text-foreground tabular-nums">{stats.score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">points</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-success tabular-nums">{stats.battlesWon}</p>
            <p className="text-xs text-muted-foreground mt-0.5">wins</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-foreground tabular-nums">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">win rate</p>
          </div>
          {(stats.streak || 0) > 0 && (
            <div className="text-center">
              <p className="text-xl font-black text-orange-500 flex items-center gap-1 tabular-nums">
                <Flame className="h-4 w-4" />{stats.streak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">streak</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

//  MAIN 

const defaultStats: LeaderboardStats = { totalPlayers: 0, battlesThisWeek: 0 };
const defaultMyRank: MyRank = { rank: 0, username: "", score: 0, battlesWon: 0, totalBattles: 0, winRate: 0 };

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(defaultMyRank);
  const [platformStats, setPlatformStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!initialized) setInitialized(true);
    Promise.all([
      leaderboardApi.getLeaderboard(timeFilter, 10),
      leaderboardApi.getMyRank(),
      leaderboardApi.getStats()
    ]).then(([lbRes, rankRes, statsRes]) => {
      if (lbRes.data?.leaderboard) setLeaderboard(lbRes.data.leaderboard);
      if (rankRes.data && !("error" in (rankRes.data as any))) setMyRank(rankRes.data);
      if (statsRes.data && !("error" in (statsRes.data as any))) setPlatformStats(statsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [timeFilter, initialized]);

  const myRankData = myRank;

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <PageBackground />
        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/*  Navbar  */}
      <Header/>
      <PageBackground />
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">

        {/*  Page Title  */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Top coders ranked by total points</p>
          </div>
          <Trophy className="h-8 w-8 text-amber-400 self-start sm:self-auto" />
        </div>

        {/*  Platform Stats  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="rounded-2xl px-5 py-4 sm:px-6 sm:py-5 gap-0">
            <CardContent className="p-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground tabular-nums">{platformStats.totalPlayers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Players</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl px-5 py-4 sm:px-6 sm:py-5 gap-0">
            <CardContent className="p-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground tabular-nums">{platformStats.battlesThisWeek.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Battles This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*  My Rank  */}
        <MyRankCard stats={myRankData} />

        {/*  Filter tabs  */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-muted rounded-xl w-fit">
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

        {/*  Podium Top 3  */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
          {/* 2nd place */}
          {topThree[1] ? (
            <div className="flex flex-col items-center gap-3 pt-0 sm:pt-6">
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
          ) : <div />}

          {/* 1st place */}
          {topThree[0] ? (
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
          ) : <div />}

          {/* 3rd place */}
          {topThree[2] ? (
            <div className="flex flex-col items-center gap-3 pt-0 sm:pt-10">
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
          ) : <div />}
        </div>

        {/*  Full Table (rank 4–10)  */}
        <Card className="rounded-2xl overflow-hidden gap-0 py-0">
          <Table>
            <TableHeader className="hidden md:table-header-group border-b border-border bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-[10%] px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</TableHead>
                <TableHead className="w-[33%] px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Player</TableHead>
                <TableHead className="w-[17%] px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</TableHead>
                <TableHead className="w-[17%] px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Win Rate</TableHead>
                <TableHead className="w-[17%] px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Battles</TableHead>
                <TableHead className="w-[6%] px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">+/-</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rest.map((entry) => (
                <TableRow
                  key={entry.username}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    getRankRowStyle(entry.rank)
                  )}
                >
                  <TableCell className="px-5 py-4 align-middle">
                    <div className="md:hidden flex items-center justify-center">
                      {getRankDisplay(entry.rank)}
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      {getRankDisplay(entry.rank)}
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar username={entry.username} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{entry.username}</p>
                        {(entry.streak || 0) > 0 && (
                          <p className="text-xs text-orange-500 flex items-center gap-0.5 font-medium">
                            <Flame className="h-3 w-3" />{entry.streak} streak
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-4 align-middle text-center">
                    <p className="text-sm font-black font-mono text-foreground tabular-nums">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground md:hidden">pts</p>
                  </TableCell>

                  <TableCell className="hidden md:table-cell px-5 py-4 align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-sm font-bold text-success">{entry.winRate}%</p>
                      <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${entry.winRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell px-5 py-4 align-middle">
                    <div className="flex items-center justify-center gap-1.5 text-sm">
                      <Swords className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span className="font-bold text-foreground tabular-nums">{entry.battlesWon}</span>
                      <span className="text-muted-foreground">/ {entry.totalBattles}</span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell px-5 py-4 align-middle">
                    <div className="flex items-center justify-center text-muted-foreground">
                      -
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/*  Footer note  */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Rankings update every 30 minutes · Showing top 10 of {platformStats.totalPlayers.toLocaleString()} players
        </p>
      </main>
    </div>
  );
}