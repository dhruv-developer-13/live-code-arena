import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, Play, Send,
  CheckCircle2, XCircle, Circle,
  LogOut, Trophy, Zap,
  Maximize, ShieldAlert,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { keymap, EditorView } from "@codemirror/view";
import type { Socket } from "socket.io-client";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "../components/ui/resizable";
import { useRunCode, useSubmitCode } from "../lib/queries";
import { battleApi } from "../lib/api";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import type { Question, RunResult, SubmitResult } from "../lib/api";
import { connectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

interface TestResult { passed: boolean; input: string; expected: string; actual: string; }
interface Submission { time: string; problem: string; status: "AC" | "WA" | "TLE"; }

const PYTHON_STUB = `# Read input and write your solution here
# Example for Two Sum:
# nums = list(map(int, input().split()))
# target = int(input())

`;
const MAX_VIOLATIONS = 3;

export default function BattleArena() {
  const { battleId = "" } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "";
  
  const [myPlayerRole, setMyPlayerRole] = useState<"p1" | "p2" | null>(null);

  const [problems, setProblems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(0);

  const [codes, setCodes] = useState<Record<number, string>>({ 0: PYTHON_STUB, 1: PYTHON_STUB, 2: PYTHON_STUB });
  const code = codes[selectedProblem] ?? PYTHON_STUB;
  const setCode = useCallback((val: string) => {
    setCodes((prev) => ({ ...prev, [selectedProblem]: val }));
  }, [selectedProblem]);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questionBestScores, setQuestionBestScores] = useState<Record<string, number>>({});

  const socketRef = useRef<Socket | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [myScorePulse, setMyScorePulse] = useState(false);
  const [oppScorePulse, setOppScorePulse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [violations, setViolations] = useState(0);
  const ignoreDisconnectRef = useRef(true);
  const lastViolationAtRef = useRef(0);

  const runMutation = useRunCode(battleId, problems[selectedProblem]?.id || "");
  const submitMutation = useSubmitCode(battleId, problems[selectedProblem]?.id || "");

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err: unknown) {
      // Ignore fullscreen errors
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen exit failures
    } finally {
      setIsFullscreen(false);
    }
  }, []);

  const leaveBattle = useCallback(async (destination: string) => {
    console.log("[Arena] leaveBattle called, destination:", destination);
    try {
      await exitFullscreen();
      console.log("[Arena] exitFullscreen done, navigating to:", destination);
      navigate(destination);
      console.log("[Arena] navigation called");
    } catch (err) {
      console.error("[Arena] leaveBattle error:", err);
      navigate(destination);
    }
  }, [exitFullscreen, navigate]);

  const pulseMyScore = useCallback(() => {
    setMyScorePulse(true);
    setTimeout(() => setMyScorePulse(false), 500);
  }, []);

  useEffect(() => {
    if (!battleId) return;
    const socket = connectSocket();
    socketRef.current = socket;

    // Handle both - already connected OR connecting now
    if (socket.connected) {
      console.log("[Arena] Socket already connected, joining battle");
      socket.emit("battle:join", { battleId });
    }

    const handleConnect = () => {
      console.log("[Arena] Socket connected, joining battle");
      socket.emit("battle:join", { battleId });
    };
    socket.on("connect", handleConnect);

    socket.on("player:role", (data: { role: "p1" | "p2"; userId: string }) => {
      console.log("[Arena] Received player:role", data);
      setMyPlayerRole(data.role);
    });

    socket.on("battle:start", (data: { endsAt: string; questions: { easy: Question; medium: Question; hard: Question } }) => {
      console.log("Arena received battle:start", data);
      const questionList = [data.questions.easy, data.questions.medium, data.questions.hard];
      setProblems(questionList);
      setLoading(false);
      setTimeLeft(Math.floor((new Date(data.endsAt).getTime() - Date.now()) / 1000));
      // Auto-enter fullscreen as soon as the server marks the battle as started.
      // void enterFullscreen();
    });

    socket.on("score:update", (data: { player1Score: number; player2Score: number }) => {
      console.log("[Arena] Score update received:", data);
      const isPlayer1 = myPlayerRole === "p1";
      const newMyScore = isPlayer1 ? data.player1Score : data.player2Score;
      const newOppScore = isPlayer1 ? data.player2Score : data.player1Score;
      setMyScore((prev) => {
        if (prev !== newMyScore) {
          pulseMyScore();
        }
        return newMyScore;
      });
      setOpponentScore(newOppScore);
    });

    socket.on("opponent_score", ({ score }: { score: number }) => {
      setOpponentScore(score);
      setOppScorePulse(true);
      setTimeout(() => setOppScorePulse(false), 600);
    });

    socket.on("battle:end", ({ cancelled }: { cancelled: boolean }) => {
      console.log("[Arena] Received battle:end event, cancelled:", cancelled);
      if (cancelled) {
        toast.error("Battle was cancelled");
        void leaveBattle("/");
      } else {
        console.log("[Arena] Navigating to results:", battleId);
        void leaveBattle(`/results/${battleId}`);
      }
    });

    socket.on("opponent_disconnected", () => {
      toast.error("Opponent disconnected!");
    });

    socket.on("battle:player_disconnected", (data: { player: string }) => {
      console.log("Player disconnected:", data.player);
      if (ignoreDisconnectRef.current) {
        console.log("[Arena] Ignoring disconnect during transition period");
        return;
      }
      toast.error(`Opponent (${data.player}) disconnected from battle!`);
    });

    return () => { 
      socket.off("connect", handleConnect);
    };
  }, [battleId, navigate, myPlayerRole, userId, enterFullscreen, leaveBattle, pulseMyScore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      ignoreDisconnectRef.current = false;
      console.log("[Arena] Now showing disconnect notifications");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          void leaveBattle(`/results/${battleId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [battleId, leaveBattle]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const currentProblem = problems[selectedProblem];
  const difficultyOrder = ["Easy", "Medium", "Hard"] as const;

  const handleRun = async () => {
    if (!currentProblem || !battleId) return;
    setRunning(true);
    setShowResults(true);
    try {
      const response = await runMutation.mutateAsync({ code, language: "python" });
      const results: RunResult[] = response.data.results;

      const testResultsArray: TestResult[] = results.map((r: RunResult) => ({
        passed: r.passed,
        input: r.input,
        expected: r.expectedOutput,
        actual: r.actualOutput || "(no output)",
      }));

      setTestResults(testResultsArray);
      toast(`Executed — ${results.filter((r: RunResult) => r.passed).length}/${results.length} passed`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Execution error", { description: message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!currentProblem || !battleId) return;
    setSubmitting(true);

    try {
      const response = await submitMutation.mutateAsync({ code, language: "python" });
      const result: SubmitResult = response.data;

      const status: "AC" | "WA" = result.passed === result.total ? "AC" : "WA";

      setSubmissions((prev) => [{ time: formatTime(Math.max(timeLeft, 0)), problem: currentProblem.title, status }, ...prev]);

      if (result.improved) {
        setQuestionBestScores((prev) => ({
          ...prev,
          [currentProblem.id]: result.points,
        }));

        if (status === "AC") {
          toast.success("Accepted!", { description: `+${result.points - (result.previousMax || 0)} points` });
        } else {
          toast(`${result.passed}/${result.total} passed`, { description: `+${result.points - (result.previousMax || 0)} points` });
        }
      } else if (result.points > 0) {
        const currentBest = questionBestScores[currentProblem.id] || result.previousMax || 0;
        setQuestionBestScores((prev) => ({
          ...prev,
          [currentProblem.id]: Math.max(currentBest, result.points),
        }));
        
        toast(`${result.passed}/${result.total} passed`, { description: `Best: ${Math.max(currentBest, result.points)} pts (no improvement)` });
      } else {
        toast.error("Wrong Answer");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Submit error", { description: message });
    } finally {
      setSubmitting(false);
    }
  }, [currentProblem, battleId, code, submitMutation, timeLeft, questionBestScores]);

  const registerViolation = useCallback((reason: string, deductPoints = true) => {
    const now = Date.now();
    // Avoid duplicate violations from blur + visibility firing together.
    if (now - lastViolationAtRef.current < 1200) return;
    lastViolationAtRef.current = now;

    if (deductPoints) {
      socketRef.current?.emit("violation", { battleId, reason });
      toast.error("Violation recorded", { description: reason });
    }

    setViolations((prev) => {
      const next = prev + 1;
      if (next >= MAX_VIOLATIONS) {
        toast.error("Disqualified", {
          description: "Too many violations. Battle will end shortly.",
        });
      } else if (!deductPoints) {
        toast.warning(`Warning ${next}/${MAX_VIOLATIONS}`, { description: reason });
      } else {
        toast.error(`Violation ${next}/${MAX_VIOLATIONS}`, { description: reason });
      }
      return next;
    });
  }, [battleId, handleSubmit, leaveBattle]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Anti-cheat: detect tab switch or app minimization.
        // registerViolation("Tab switching or window minimizing detected.");
      }
    };

    const handleBlur = () => {
      // Anti-cheat: detect focus leaving the battle window.
      // registerViolation("Window focus lost.");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Anti-cheat: exiting fullscreen during battle is a violation.
        // registerViolation("Exited fullscreen mode.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [registerViolation]);

  const acceptedIds = useMemo(
    () => new Set(submissions.filter((s) => s.status === "AC").map((s) => s.problem)),
    [submissions],
  );
  const isCurrentAccepted = currentProblem ? acceptedIds.has(currentProblem.title) : false;

  const handleSubmitAndLeave = useCallback(async () => {
    if (currentProblem && !acceptedIds.has(currentProblem.title)) {
      await handleSubmit();
    }
    await leaveBattle(`/results/${battleId}`);
  }, [currentProblem, handleSubmit, battleId, acceptedIds, leaveBattle]);

  const isUrgent = timeLeft < 5 * 60;
  const iLeading = myScore >= opponentScore;

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">

      {/* {showFullscreenPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Maximize className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">Enter Fullscreen</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This contest requires fullscreen mode. Tab switching, window changes, and exiting fullscreen will be recorded as violations.
              </p>
            </div>
            <div className="w-full space-y-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-4 text-left">
              <p className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Right-click is disabled</p>
              <p className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Copy/paste is disabled</p>
              <p className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Tab switching is monitored</p>
              <p className="flex items-center gap-2"><ShieldX className="h-3.5 w-3.5 text-rose-500 shrink-0" /> {MAX_VIOLATIONS} violations = disqualification</p>
            </div>
            <button onClick={enterFullscreen} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors">
              Enter Fullscreen & Start
            </button>
          </div>
        </div>
      )} */}

      {/* {showViolationWarning && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowViolationWarning(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5">
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", violations >= MAX_VIOLATIONS ? "bg-rose-500/20" : "bg-amber-500/15")}>
              <ShieldX className={cn("h-7 w-7", violations >= MAX_VIOLATIONS ? "text-rose-500" : "text-amber-500")} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">{violations >= MAX_VIOLATIONS ? "Disqualified" : `Violation ${violations}/${MAX_VIOLATIONS}`}</h2>
              <p className="text-sm text-muted-foreground mb-3">{violationReason}</p>
              {violations >= MAX_VIOLATIONS
                ? <p className="text-xs text-rose-500 font-semibold">You have been disqualified. Redirecting…</p>
                : <p className="text-xs text-muted-foreground">{MAX_VIOLATIONS - violations} more violation{MAX_VIOLATIONS - violations !== 1 ? "s" : ""} will result in disqualification.</p>}
            </div>
            {violations < MAX_VIOLATIONS && (
              <button onClick={() => { setShowViolationWarning(false); enterFullscreen(); }} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors">
                Return to Fullscreen
              </button>
            )}
          </div>
        </div>
      )} */}

      {showLeaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLeaveDialog(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-7 w-7 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Leave the Arena?</h2>
              <p className="text-sm text-muted-foreground">Submit your current code and see results, or forfeit and go home.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => { setShowLeaveDialog(false); handleSubmitAndLeave(); }}
                className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Submit & Leave
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowLeaveDialog(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors">Stay</button>
                <button onClick={async () => {
                  try {
                    console.log("[Forfeit] Starting forfeit for battle:", battleId);
                    await battleApi.forfeit(battleId);
                    console.log("[Forfeit] API call succeeded, waiting for battle:end event...");
                  } catch (err) {
                    console.error("[Forfeit] API error:", err);
                    toast.error("Failed to forfeit battle");
                  }
                }} className="flex-1 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-semibold transition-colors">Forfeit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="relative flex items-center h-14 px-2 sm:px-6">
          <div className={cn(
            "flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-sm sm:text-base font-bold transition-all duration-300",
            isUrgent ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 animate-pulse" : "bg-muted text-foreground"
          )}>
            <Clock className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="hidden sm:inline">{formatTime(timeLeft)}</span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4">
            <div className={cn("flex flex-col sm:flex-row items-center sm:gap-2 px-2 sm:px-4 py-1 rounded-xl transition-all duration-300", iLeading ? "bg-emerald-500/15 ring-1 ring-emerald-500/40" : "bg-muted")}>
              <span className="hidden sm:block text-xs text-muted-foreground font-medium leading-none">You</span>
              <span className={cn("text-lg sm:text-xl font-black font-mono tabular-nums transition-all duration-300", iLeading ? "text-emerald-500" : "text-foreground", myScorePulse && "scale-125")}>{myScore}</span>
            </div>
            <span className="text-muted-foreground font-bold text-xs sm:text-sm">vs</span>
            <div className={cn("flex flex-col sm:flex-row items-center sm:gap-2 px-2 sm:px-4 py-1 rounded-xl transition-all duration-300", !iLeading ? "bg-rose-500/15 ring-1 ring-rose-500/40" : "bg-muted")}>
              <span className="hidden sm:block text-xs text-muted-foreground font-medium leading-none">Opponent</span>
              <span className={cn("text-lg sm:text-xl font-black font-mono tabular-nums transition-all duration-300", !iLeading ? "text-rose-500" : "text-foreground", oppScorePulse && "scale-125")}>{opponentScore}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className={cn(
              "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
              violations === 0 && "bg-emerald-500/10 border-emerald-500/20 text-success",
              violations === 1 && "bg-amber-500/10 border-amber-500/20 text-warning",
              violations >= 2 && "bg-rose-500/10 border-rose-500/20 text-danger",
            )}>
              <ShieldAlert className="h-3.5 w-3.5" />
              {violations}/{MAX_VIOLATIONS}
            </div>
            {!isFullscreen && (
              <button onClick={enterFullscreen} className="hidden sm:flex p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Enter fullscreen">
                <Maximize className="h-4 w-4" />
              </button>
            )}
            <ThemeToggleButton />
            <button onClick={() => setShowLeaveDialog(true)} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-success text-xs sm:text-sm font-semibold transition-colors border border-emerald-500/20">
              <LogOut className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              <span className="hidden sm:inline">Submit & Leave</span>
              <span className="sm:hidden">Leave</span>
            </button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="flex-1 flex overflow-hidden">
        <ResizablePanel defaultSize="30" maxSize="30" minSize="0" collapsible collapsedSize="0">
          <div
            className="h-full border-r border-border bg-card flex flex-col overflow-hidden"
            // onCopy={(e) => {
            //   // Anti-cheat: block copying from the problem statement.
            //   e.preventDefault();
            //   registerViolation("Copying from question panel is blocked.");
            // }}
            // onCut={(e) => {
            //   // Anti-cheat: block cut operations from the problem panel.
            //   e.preventDefault();
            //   registerViolation("Cut is blocked.");
            // }}
            // onMouseUp={handleQuestionSelectionAttempt}
            // onKeyUp={handleQuestionSelectionAttempt}
            // onContextMenu={(e) => {
            //   // Anti-cheat: disable right-click context actions in battle mode.
            //   e.preventDefault();
            //   registerViolation("Right-click menu is disabled during battle.");
            // }}
          >
            <div className="flex border-b border-border shrink-0">
              {difficultyOrder.map((diff, i) => (
                <button key={diff} onClick={() => setSelectedProblem(i)}
                  className={cn("flex-1 py-3 text-sm font-semibold transition-colors relative", selectedProblem === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <span className={cn(diff === "Easy" && "text-emerald-500", diff === "Medium" && "text-amber-500", diff === "Hard" && "text-rose-500")}>{diff}</span>
                  {selectedProblem === i && <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", diff === "Easy" && "bg-emerald-500", diff === "Medium" && "bg-amber-500", diff === "Hard" && "bg-rose-500")} />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ userSelect: "text", WebkitUserSelect: "text" }}>
              {loading && (
                <div className="flex flex-col gap-3 animate-pulse pt-4">
                  <div className="h-6 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-20 bg-muted rounded-lg mt-4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              )}
              {!loading && currentProblem && (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug">{currentProblem.title}</h2>
                    <span className={cn(
                      "shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                      currentProblem.difficulty === "EASY" && "bg-emerald-500/15 text-success",
                      currentProblem.difficulty === "MEDIUM" && "bg-amber-500/15 text-warning",
                      currentProblem.difficulty === "HARD" && "bg-rose-500/15 text-danger",
                    )}>{currentProblem.difficulty}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentProblem.description}</p>
                  <div className="space-y-3">
                    {currentProblem.sampleCases?.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-border overflow-hidden">
                        <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                          <span className="text-xs font-bold text-muted-foreground">Example {i + 1}</span>
                        </div>
                        <div className="p-3 space-y-2 font-mono text-xs">
                          <div><span className="font-bold text-foreground">Input:&nbsp;</span><span className="text-muted-foreground whitespace-pre-wrap">{ex.input}</span></div>
                          <div><span className="font-bold text-foreground">Output:&nbsp;</span><span className="text-muted-foreground">{ex.expectedOutput}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-2">Constraints</h4>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      {currentProblem.constraints.split("\n").map((line, i) => (
                        <p key={i} className="text-xs font-mono text-muted-foreground leading-6"><span className="mr-2 text-foreground">•</span>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-1.5 bg-muted/50 border-b border-border"><span className="text-xs font-bold text-muted-foreground">Input Format</span></div>
                      <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{currentProblem.inputFormat}</pre>
                    </div>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="px-3 py-1.5 bg-muted/50 border-b border-border"><span className="text-xs font-bold text-muted-foreground">Output Format</span></div>
                      <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{currentProblem.outputFormat}</pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="50" minSize="50">
          <div className="h-full flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-info">Python 3</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRun} disabled={running || loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50">
                  <Play className="h-3.5 w-3.5" />
                  {running ? "Running…" : "Run"}
                </button>
                <button onClick={handleSubmit} disabled={submitting || loading || isCurrentAccepted} title={isCurrentAccepted ? "Already solved!" : undefined} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="h-3.5 w-3.5" />
                  {isCurrentAccepted ? "Solved ✓" : submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>

            <ResizablePanelGroup orientation="vertical" className="flex-1 min-h-0">
              <ResizablePanel defaultSize="100" minSize="50">
                <div className="relative h-full">
                  <CodeMirror
                    value={code}
                    height="100%"
                    theme={oneDark}
                    extensions={[
                      python(),
                      keymap.of([
                        indentWithTab,
                        // {
                        //   key: "Mod-c",
                        //   run: () => {
                        //     // Anti-cheat: disable keyboard copy shortcut in editor.
                        //     registerViolation("Copy shortcut is disabled.");
                        //     return true;
                        //   },
                        // },
                        // {
                        //   key: "Mod-v",
                        //   run: () => {
                        //     // Anti-cheat: disable keyboard paste shortcut in editor.
                        //     registerViolation("Paste shortcut is disabled.");
                        //     return true;
                        //   },
                        // },
                        // {
                        //   key: "Mod-x",
                        //   run: () => {
                        //     // Anti-cheat: disable keyboard cut shortcut in editor.
                        //     registerViolation("Cut shortcut is disabled.");
                        //     return true;
                        //   },
                        // },
                      ]),
                      // EditorView.domEventHandlers({
                      //   copy: (event) => {
                      //     // Anti-cheat: block copy action from editor context menu.
                      //     event.preventDefault();
                      //     registerViolation("Copy is disabled in the editor.");
                      //     return true;
                      //   },
                      //   cut: (event) => {
                      //     // Anti-cheat: block cut action from editor context menu.
                      //     event.preventDefault();
                      //     registerViolation("Cut is disabled in the editor.");
                      //     return true;
                      //   },
                      //   paste: (event) => {
                      //     // Anti-cheat: block paste into editor during battle.
                      //     event.preventDefault();
                      //     registerViolation("Paste is disabled in the editor.");
                      //     return true;
                      //   },
                      //   contextmenu: (event) => {
                      //     // Anti-cheat: disable right-click menu in the coding editor.
                      //     event.preventDefault();
                      //     registerViolation("Right-click is disabled in the editor.");
                      //     return true;
                      //   },
                      // }),
                      EditorView.theme({
                        ".cm-content, .cm-line, .cm-scroller": {
                          userSelect: "text",
                        },
                      }),
                    ]}
                    onChange={(value) => setCode(value)}
                    className="absolute inset-0 w-full h-full text-sm"
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: false,
                      highlightActiveLine: true,
                      highlightActiveLineGutter: true,
                    }}
                  />
                </div>
              </ResizablePanel>

              {showResults && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize="30" minSize="15" maxSize="50">
                    <div className="h-full flex flex-col border-t border-border bg-card">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Test Results</span>
                          <span className="text-xs text-muted-foreground">{testResults.filter((r) => r.passed).length}/{testResults.length} passed</span>
                        </div>
                        <button onClick={() => setShowResults(false)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Close">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {testResults.map((r, i) => (
                          <div key={i} className={cn("rounded-xl border p-3 text-xs font-mono space-y-1.5", r.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20")}>
                            <div className="flex items-center gap-2 mb-2">
                              {r.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                              <span className={cn("font-bold font-sans text-xs", r.passed ? "text-success" : "text-danger")}>
                                Case {i + 1}: {r.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                            <p><span className="text-muted-foreground">Input: </span>{r.input}</p>
                            <p><span className="text-muted-foreground">Expected: </span>{r.expected}</p>
                            {!r.passed && <p><span className="text-muted-foreground">Actual: </span>{r.actual}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
        <ResizableHandle />

        <ResizablePanel defaultSize="20" minSize="20" maxSize="20">
          <div className="h-full border-l border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">Live Score</h3>
              </div>
              <div className="space-y-3">
                <div className={cn("relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500", iLeading ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/50 border-border")}>
                  {iLeading && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />}
                  <div className="flex items-center gap-2">{iLeading && <Trophy className="h-3.5 w-3.5 text-emerald-500" />}<span className="font-semibold text-sm">You</span></div>
                  <span className={cn("font-black font-mono text-xl transition-all duration-300", iLeading ? "text-emerald-500" : "text-foreground", myScorePulse && "scale-125")}>{myScore}</span>
                </div>
                <div className={cn("relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500", !iLeading ? "bg-rose-500/10 border-rose-500/30" : "bg-muted/50 border-border")}>
                  {!iLeading && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />}
                  <div className="flex items-center gap-2">{!iLeading && <Trophy className="h-3.5 w-3.5 text-rose-500" />}<span className="font-semibold text-sm">Opponent</span></div>
                  <span className={cn("font-black font-mono text-xl transition-all duration-300", !iLeading ? "text-rose-500" : "text-foreground", oppScorePulse && "scale-125")}>{opponentScore}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  {myScore + opponentScore > 0 && (
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${(myScore / (myScore + opponentScore)) * 100}%` }} />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-sm mb-4">Your Progress</h3>
              <div className="space-y-2.5">
                {difficultyOrder.map((diff) => {
                  const maxPts = diff === "Easy" ? 100 : diff === "Medium" ? 200 : 300;
                  return (
                    <div key={diff} className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", diff === "Easy" && "text-success", diff === "Medium" && "text-warning", diff === "Hard" && "text-danger")}>{diff}</span>
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono"><Circle className="h-3.5 w-3.5" />0/{maxPts}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-bold text-sm mb-4">Submissions</h3>
              <div className="space-y-2">
                {submissions.length === 0
                  ? <p className="text-xs text-muted-foreground">No submissions yet</p>
                  : submissions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50 text-xs border border-border">
                      <div>
                        <p className="font-semibold text-foreground leading-snug">{sub.problem}</p>
                        <p className="text-muted-foreground mt-0.5">{sub.time}</p>
                      </div>
                      <span className={cn("font-black font-mono text-xs px-2 py-0.5 rounded-md", sub.status === "AC" && "bg-emerald-500/15 text-success", sub.status === "WA" && "bg-rose-500/15 text-danger", sub.status === "TLE" && "bg-amber-500/15 text-warning")}>{sub.status}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
