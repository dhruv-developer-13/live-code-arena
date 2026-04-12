import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy, Plus, Share2, Swords, Home,
  Brain, Loader2, AlertTriangle,
  CheckCircle2,
  Target, BarChart3,
} from "lucide-react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { cn } from "@/lib/utils";
import { Card as CardContainer } from "@/components/ui/card";
import { useBattleResults } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";

const DIFF = {
  EASY: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
  MEDIUM: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "bg-amber-500" },
  HARD: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "bg-rose-500" },
} as const;

export default function Results() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: battleData, isLoading, error } = useBattleResults(battleId || "");

  useEffect(() => {
    if (!battleId) {
      navigate("/");
    }
  }, [battleId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <PageBackground />
        <main className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-muted-foreground">Loading battle results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !battleData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <PageBackground />
        <main className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
            <p className="text-sm text-muted-foreground">Failed to load battle results</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
            >
              Go Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { data: battle } = battleData;
  const { players, questions, submissions, winner, status } = battle;

  // Debug logging
  console.log("[Results] Full battle data:", JSON.stringify({ 
    players: { p1: players.player1?.id, p2: players.player2?.id },
    winner: winner?.id,
    status 
  }));
  console.log("[Results] Current user:", user?.id);

  // If user is not in the battle, we can't determine winner/loser
  const isInBattle = user?.id === players.player1?.id || user?.id === players.player2?.id;
  if (!isInBattle) {
    console.log("[Results] User not in battle!");
  }

  const isPlayer1 = user?.id === players.player1?.id;
  const myPlayer = isPlayer1 ? players.player1 : (user?.id === players.player2?.id ? players.player2 : players.player1);
  const opponentPlayer = isPlayer1 ? players.player2 : (user?.id === players.player2?.id ? players.player1 : players.player2);
  
  const myTotal = myPlayer?.total || 0;
  const opponentTotal = opponentPlayer?.total || 0;
  const isWinner = isInBattle && user?.id && winner?.id && user.id === winner.id;
  const isTie = myTotal === opponentTotal && status === "COMPLETED";
  const maxPossible = 600;

  const questionList = Object.values(questions);

  const handleShare = () => {
    const text = `I just ${isWinner ? "won" : isTie ? "tied" : "lost"} a CodeArena battle! ${myTotal} vs ${opponentTotal}`;
    if (navigator.share) {
      navigator.share({ title: "CodeArena Result", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const solved = questionList.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <PageBackground
        gridOpacityClass="opacity-30"
        glowSize="compact"
        glowTone={isWinner ? "emerald" : isTie ? "amber" : "rose"}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">

        <div className="grid lg:grid-cols-3 gap-4 items-stretch">

          <div className={cn(
            "lg:col-span-2 rounded-2xl border p-8 flex flex-col justify-between relative overflow-hidden",
            isWinner ? "bg-emerald-500/5 border-emerald-500/20"
              : isTie ? "bg-amber-500/5 border-amber-500/20"
                : "bg-rose-500/5 border-rose-500/20"
          )}>
            <div className={cn(
              "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20",
              isWinner ? "bg-emerald-500" : isTie ? "bg-amber-500" : "bg-rose-500"
            )} />

            <div className="flex items-start justify-between gap-6 relative">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isWinner ? "bg-emerald-500/15 border border-emerald-500/30"
                      : isTie ? "bg-amber-500/15 border border-amber-500/30"
                        : "bg-rose-500/15 border border-rose-500/30"
                  )}>
                    <Trophy className={cn("h-5 w-5", isWinner ? "text-emerald-400" : isTie ? "text-amber-400" : "text-rose-400")} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Battle Result</span>
                </div>
                <h1 className={cn(
                  "text-6xl font-black tracking-tighter leading-none mb-3",
                  isWinner ? "text-emerald-400" : isTie ? "text-amber-400" : "text-rose-400"
                )}>
                  {isWinner ? "Victory" : isTie ? "Tied" : "Defeat"}
                </h1>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {isWinner ? "Outscored your opponent across the board. Clean win."
                    : isTie ? "A perfectly matched battle. Neither player could pull ahead."
                      : "Your opponent had the edge this time. Study the breakdown below."}
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">You</p>
                  <p className={cn(
                    "text-5xl font-black font-mono tabular-nums",
                    isWinner ? "text-emerald-400" : isTie ? "text-foreground" : "text-rose-400"
                  )}>{myTotal}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ {maxPossible}</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-muted-foreground/40">—</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Opponent</p>
                  <p className={cn(
                    "text-5xl font-black font-mono tabular-nums",
                    !isWinner && !isTie ? "text-emerald-400" : "text-foreground"
                  )}>{opponentTotal}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ {maxPossible}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 relative">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Your share</span>
                <span>{myTotal + opponentTotal > 0 ? Math.round((myTotal / (myTotal + opponentTotal)) * 100) : 50}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", isWinner ? "bg-emerald-500" : isTie ? "bg-amber-500" : "bg-rose-500")}
                  style={{ width: `${myTotal + opponentTotal > 0 ? (myTotal / (myTotal + opponentTotal)) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <CardContainer className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problems</span>
              </div>
              <div>
                <p className="text-5xl font-black tabular-nums text-foreground">{solved}<span className="text-2xl text-muted-foreground font-bold">/{questionList.length}</span></p>
                <div className="flex gap-1.5 mt-3">
                  {questionList.map((q, i) => (
                    <div key={i} className={cn("flex-1 h-1.5 rounded-full", DIFF[q.difficulty]?.bar || "bg-muted")} />
                  ))}
                </div>
              </div>
            </CardContainer>

            <CardContainer className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums text-foreground">{status}</p>
                <p className="text-sm text-muted-foreground mt-1">Battle completed</p>
              </div>
            </CardContainer>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Problem Breakdown</h2>
          </div>

          <div className="space-y-3">
            {questionList.map((question) => {
              const diff = DIFF[question.difficulty as keyof typeof DIFF];
              const mySubmission = submissions.find(s => s.questionId === question.id && s.userId === myPlayer?.id);
              const oppSubmission = submissions.find(s => s.questionId === question.id && s.userId === opponentPlayer?.id);

              const myScore = mySubmission?.pointsEarned || 0;
              const oppScore = oppSubmission?.pointsEarned || 0;
              const myTests = mySubmission?.testCasesPassed || 0;
              const maxPts = question.difficulty === "EASY" ? 100 : question.difficulty === "MEDIUM" ? 200 : 300;

              const youWon = myScore > oppScore;
              const tied = myScore === oppScore;

              return (
                <CardContainer key={question.id} padding="none">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className={cn("shrink-0 px-3 py-1 rounded-lg text-xs font-bold border", diff?.bg, diff?.border, diff?.color)}>
                      {question.difficulty}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{question.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className={cn("h-3 w-3", myTests === 10 ? "text-emerald-500" : "text-muted-foreground")} />
                          {myTests} tests
                        </span>
                      </div>
                    </div>

                    <div className="w-48 shrink-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-14 text-right font-mono">{myScore}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", youWon ? "bg-emerald-500" : tied ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(myScore / maxPts) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-14 text-right font-mono">{oppScore}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", !youWon && !tied ? "bg-emerald-500" : "bg-muted-foreground/30")} style={{ width: `${(oppScore / maxPts) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right w-20">
                      <p className="text-lg font-black font-mono">
                        <span className={youWon ? "text-emerald-400" : tied ? "text-foreground" : "text-rose-400"}>{myScore}</span>
                        <span className="text-muted-foreground/40 mx-1 text-sm">·</span>
                        <span className={!youWon && !tied ? "text-emerald-400" : "text-muted-foreground"}>{oppScore}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">of {maxPts}</p>
                    </div>
                  </div>
                </CardContainer>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/battle-room")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors">
            <Swords className="h-4 w-4" /> Rematch
          </button>
          <button onClick={() => navigate("/battle-room")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors">
            <Plus className="h-4 w-4" /> New Battle
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold transition-colors">
            <Share2 className="h-4 w-4" /> Share Result
          </button>
          <button onClick={() => navigate("/")}
            className="ml-auto flex items-center gap-1.5 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
            <Home className="h-4 w-4" /> Dashboard
          </button>
        </div>

        {battleId && <p className="text-center text-xs text-muted-foreground/40 font-mono">Battle ID: {battleId}</p>}
      </main>
    </div>
  );
}
