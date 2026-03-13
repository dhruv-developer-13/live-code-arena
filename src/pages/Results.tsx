import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy, RefreshCw, Plus, Share2, Code2,
  CheckCircle2, XCircle, Clock, Swords, Home,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface QuestionResult {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  yourScore: number;
  opponentScore: number;
  maxScore: number;
  testsPassed: { you: number; opponent: number; total: number };
  bestTime: { you: string | null; opponent: string | null };
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// TODO: fetch from /api/results/:roomCode

const mockResults: QuestionResult[] = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    yourScore: 100,
    opponentScore: 85,
    maxScore: 100,
    testsPassed: { you: 10, opponent: 8, total: 10 },
    bestTime: { you: "2:34", opponent: "3:12" },
  },
  {
    title: "Longest Substring",
    difficulty: "Medium",
    yourScore: 180,
    opponentScore: 200,
    maxScore: 200,
    testsPassed: { you: 9, opponent: 10, total: 10 },
    bestTime: { you: "8:45", opponent: "7:20" },
  },
  {
    title: "Median of Arrays",
    difficulty: "Hard",
    yourScore: 0,
    opponentScore: 150,
    maxScore: 300,
    testsPassed: { you: 0, opponent: 5, total: 10 },
    bestTime: { you: null, opponent: "15:33" },
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Results() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const myTotal       = mockResults.reduce((sum, r) => sum + r.yourScore, 0);
  const opponentTotal = mockResults.reduce((sum, r) => sum + r.opponentScore, 0);
  const isWinner      = myTotal > opponentTotal;
  const isTie         = myTotal === opponentTotal;

  // Confetti state
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isWinner) {
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
      setConfettiPieces(
        Array.from({ length: 24 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.6,
          color: colors[i % colors.length],
        }))
      );
      const t = setTimeout(() => setConfettiPieces([]), 3200);
      return () => clearTimeout(t);
    }
  }, [isWinner]);

  const handleShare = () => {
    const text = `I just ${isWinner ? "won" : isTie ? "tied"  : "lost"} a CodeArena battle! Score: ${myTotal} vs ${opponentTotal}`;
    if (navigator.share) {
      navigator.share({ title: "CodeArena Result", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* ── Winner Banner ──────────────────────────────────────────── */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl p-10 text-center border",
          isWinner
            ? "bg-emerald-500/5 border-emerald-500/25"
            : isTie
            ? "bg-amber-500/5 border-amber-500/25"
            : "bg-rose-500/5 border-rose-500/25",
        )}>
          {/* Confetti */}
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 rounded-sm animate-bounce pointer-events-none"
              style={{
                left: `${p.left}%`,
                top: `${10 + Math.random() * 80}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: "1s",
                opacity: 0.8,
              }}
            />
          ))}

          {/* Trophy icon */}
          <div className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5",
            isWinner ? "bg-emerald-500/15 border border-emerald-500/30"
            : isTie  ? "bg-amber-500/15 border border-amber-500/30"
            :           "bg-rose-500/15 border border-rose-500/30",
          )}>
            <Trophy className={cn(
              "h-8 w-8",
              isWinner ? "text-emerald-500" : isTie ? "text-amber-500" : "text-rose-500"
            )} />
          </div>

          {/* Headline */}
          <h1 className={cn(
            "text-4xl font-black tracking-tight mb-2",
            isWinner ? "text-emerald-500" : isTie ? "text-amber-500" : "text-rose-500"
          )}>
            {isWinner ? "Victory!" : isTie ? "It's a Tie!" : "Defeat"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
            {isWinner
              ? "Congratulations! You outpaced your opponent."
              : isTie
              ? "A perfectly matched battle. Well fought by both."
              : "Tough loss — every battle sharpens the blade."}
          </p>

          {/* Score comparison */}
          <div className="flex items-center justify-center gap-10">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium mb-1">You</p>
              <p className={cn(
                "text-5xl font-black font-mono tabular-nums",
                isWinner ? "text-emerald-500" : isTie ? "text-foreground" : "text-rose-500"
              )}>
                {myTotal}
              </p>
            </div>
            <span className="text-2xl text-muted-foreground font-bold">vs</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium mb-1">Opponent</p>
              <p className={cn(
                "text-5xl font-black font-mono tabular-nums",
                !isWinner && !isTie ? "text-emerald-500" : isTie ? "text-foreground" : "text-foreground"
              )}>
                {opponentTotal}
              </p>
            </div>
          </div>

          {/* Room code badge */}
          {roomCode && (
            <p className="mt-6 text-xs text-muted-foreground/60 font-mono">
              Room: {roomCode}
            </p>
          )}
        </div>

        {/* ── Summary stat row ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Problems Solved",
              value: `${mockResults.filter((r) => r.yourScore > 0).length}/${mockResults.length}`,
              color: "text-foreground",
            },
            {
              label: "Total Score",
              value: myTotal,
              color: isWinner ? "text-emerald-500" : isTie ? "text-amber-500" : "text-rose-500",
            },
            {
              label: "Opponent Score",
              value: opponentTotal,
              color: !isWinner && !isTie ? "text-emerald-500" : "text-foreground",
            },
          ].map(({ label, value, color }) => (
            <Card key={label} className="rounded-2xl">
              <CardContent className="p-5">
                <p className={cn("text-2xl font-black font-mono", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Question Breakdown ─────────────────────────────────────── */}
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-bold">Question Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {mockResults.map((result) => {
                const youWonThis = result.yourScore > result.opponentScore;
                const tied       = result.yourScore === result.opponentScore;
                return (
                  <div key={result.title} className="p-5">

                    {/* Top row: title + scores */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{result.title}</p>
                        <span className={cn(
                          "inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold",
                          result.difficulty === "Easy"   && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          result.difficulty === "Medium" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          result.difficulty === "Hard"   && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                        )}>
                          {result.difficulty}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black font-mono">
                          <span className={cn(youWonThis ? "text-emerald-500" : tied ? "text-foreground" : "text-rose-500")}>
                            {result.yourScore}
                          </span>
                          <span className="text-muted-foreground mx-2 text-base font-bold">—</span>
                          <span className={cn(!youWonThis && !tied ? "text-emerald-500" : "text-foreground")}>
                            {result.opponentScore}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">of {result.maxScore} pts</p>
                      </div>
                    </div>

                    {/* Score progress bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          youWonThis ? "bg-emerald-500" : tied ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${result.maxScore > 0 ? (result.yourScore / result.maxScore) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        {result.testsPassed.you === result.testsPassed.total
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                        <span className="text-muted-foreground">Tests passed:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {result.testsPassed.you}/{result.testsPassed.total}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-mono font-semibold text-foreground">
                          {result.testsPassed.opponent}/{result.testsPassed.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {result.bestTime.you ?? "—"}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-mono font-semibold text-foreground">
                          {result.bestTime.opponent ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/battle-room")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
          >
            <Swords className="h-4 w-4" />
            Rematch
          </button>
          <button
            onClick={() => navigate("/battle-room")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Battle
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Result
          </button>
        </div>

        {/* Back to dashboard */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Back to Dashboard
          </button>
        </div>

      </main>
    </div>
  );
}