import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock, Play, Send,
  CheckCircle2, XCircle, Circle,
  LogOut, Trophy, Zap,
  Maximize, ShieldAlert, ShieldX,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "../components/ui/resizable";
import { useRunCode, useSubmitCode } from "../lib/queries";
import { io, Socket } from "socket.io-client";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import type { Question, RunResult, SubmitResult } from "../lib/api";

interface TestResult { passed: boolean; input: string; expected: string; actual: string; }
interface Submission { time: string; problem: string; status: "AC" | "WA" | "TLE"; }

const TOTAL_SECONDS = 45 * 60;
const PYTHON_STUB = `# Read input and write your solution here
# Example for Two Sum:
# nums = list(map(int, input().split()))
# target = int(input())

`;
const MAX_VIOLATIONS = 3;

export default function BattleArena() {
  const { battleId = "" } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") ?? "player1";

  const [problems, setProblems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(0);

  const [codes, setCodes] = useState<Record<number, string>>({ 0: PYTHON_STUB, 1: PYTHON_STUB, 2: PYTHON_STUB });
  const code = codes[selectedProblem] ?? PYTHON_STUB;
  const setCode = useCallback((val: string) => {
    setCodes((prev) => ({ ...prev, [selectedProblem]: val }));
  }, [selectedProblem]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myProgress, setMyProgress] = useState<Record<string, number | null>>({ Easy: null, Medium: null, Hard: null });
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [myScorePulse, setMyScorePulse] = useState(false);
  const [oppScorePulse, setOppScorePulse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [violations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationReason] = useState("");

  const runMutation = useRunCode(battleId, problems[selectedProblem]?.id || "");
  const submitMutation = useSubmitCode(battleId, problems[selectedProblem]?.id || "");

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenPrompt(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please allow fullscreen in your browser.";
      toast.error("Could not enter fullscreen", { description: message });
    }
  }, []);

  useEffect(() => {
    if (!battleId) return;
    const socket = io("http://localhost:3000", {
      auth: { token: localStorage.getItem("token") || undefined },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("battle:join", { battleId });
    });

    socket.on("battle:start", (data: { endsAt: string; questions: { easy: Question; medium: Question; hard: Question } }) => {
      console.log("Arena received battle:start", data);
      const questionList = [data.questions.easy, data.questions.medium, data.questions.hard];
      setProblems(questionList);
      setLoading(false);
      setTimeLeft(Math.floor((new Date(data.endsAt).getTime() - Date.now()) / 1000));
    });

    socket.on("score:update", (data: { player1Score: number; player2Score: number }) => {
      const isPlayer1 = username === "player1" || searchParams.get("role") === "host";
      const newMyScore = isPlayer1 ? data.player1Score : data.player2Score;
      const newOppScore = isPlayer1 ? data.player2Score : data.player1Score;
      setMyScore(newMyScore);
      setOpponentScore(newOppScore);
    });

    socket.on("opponent_score", ({ score }: { score: number }) => {
      setOpponentScore(score);
      setOppScorePulse(true);
      setTimeout(() => setOppScorePulse(false), 600);
    });

    socket.on("battle:end", ({ cancelled }: { cancelled: boolean }) => {
      if (cancelled) {
        toast.error("Battle was cancelled");
        navigate("/");
      } else {
        navigate(`/results/${battleId}`);
      }
    });

    socket.on("opponent_disconnected", () => {
      toast.error("Opponent disconnected!");
    });

    return () => { socket.disconnect(); };
  }, [battleId, navigate, username, searchParams]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          navigate(`/results/${battleId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate, battleId]);

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

      setSubmissions((prev) => [{ time: formatTime(TOTAL_SECONDS - timeLeft), problem: currentProblem.title, status }, ...prev]);

      if (result.points > 0) {
        setMyScore((prev) => {
          const next = prev + result.points;
          setMyScorePulse(true);
          setTimeout(() => setMyScorePulse(false), 600);
          return next;
        });
        
        const diff = currentProblem.difficulty.toLowerCase() as "easy" | "medium" | "hard";
        setMyProgress((p) => ({ ...p, [diff]: (p[diff] || 0) + result.points }));

        if (status === "AC") {
          toast.success("Accepted!", { description: `+${result.points} points` });
        } else {
          toast(`${result.passed}/${result.total} passed`, { description: `+${result.points} points` });
        }
      } else {
        toast.error("Wrong Answer");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Submit error", { description: message });
    } finally {
      setSubmitting(false);
    }
  }, [currentProblem, battleId, code, submitMutation, timeLeft]);

  const acceptedIds = new Set(submissions.filter((s) => s.status === "AC").map((s) => s.problem));
  const isCurrentAccepted = currentProblem ? acceptedIds.has(currentProblem.title) : false;

  const handleSubmitAndLeave = useCallback(async () => {
    if (currentProblem && !acceptedIds.has(currentProblem.title)) {
      await handleSubmit();
    }
    navigate(`/results/${battleId}`);
  }, [currentProblem, handleSubmit, navigate, battleId, acceptedIds]);

  const blockClipboard = useCallback((/*_e: React.ClipboardEvent */) => {
    // disabled for testing
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = codeRef.current.slice(0, start) + "    " + codeRef.current.slice(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = start + 4;
        textarea.selectionEnd = start + 4;
      });
    }
  }, [setCode]);

  const isUrgent = timeLeft < 5 * 60;
  const iLeading = myScore >= opponentScore;

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">

      {showFullscreenPrompt && (
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
      )}

      {showViolationWarning && (
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
      )}

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
                <button onClick={() => navigate("/")} className="flex-1 px-4 py-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-semibold transition-colors">Forfeit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="relative flex items-center h-14 px-6">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-base font-bold transition-all duration-300",
            isUrgent ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 animate-pulse" : "bg-muted text-foreground"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className={cn("flex flex-col items-center px-4 py-1 rounded-xl transition-all duration-300", iLeading ? "bg-emerald-500/15 ring-1 ring-emerald-500/40" : "bg-muted")}>
              <span className="text-xs text-muted-foreground font-medium leading-none mb-0.5">You</span>
              <span className={cn("text-xl font-black font-mono tabular-nums transition-all duration-300", iLeading ? "text-emerald-500" : "text-foreground", myScorePulse && "scale-125")}>{myScore}</span>
            </div>
            <span className="text-muted-foreground font-bold text-sm">vs</span>
            <div className={cn("flex flex-col items-center px-4 py-1 rounded-xl transition-all duration-300", !iLeading ? "bg-rose-500/15 ring-1 ring-rose-500/40" : "bg-muted")}>
              <span className="text-xs text-muted-foreground font-medium leading-none mb-0.5">Opponent</span>
              <span className={cn("text-xl font-black font-mono tabular-nums transition-all duration-300", !iLeading ? "text-rose-500" : "text-foreground", oppScorePulse && "scale-125")}>{opponentScore}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
              violations === 0 && "bg-emerald-500/10 border-emerald-500/20 text-success",
              violations === 1 && "bg-amber-500/10 border-amber-500/20 text-warning",
              violations >= 2 && "bg-rose-500/10 border-rose-500/20 text-danger",
            )}>
              <ShieldAlert className="h-3.5 w-3.5" />
              {violations}/{MAX_VIOLATIONS}
            </div>
            {!isFullscreen && (
              <button onClick={enterFullscreen} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Enter fullscreen">
                <Maximize className="h-4 w-4" />
              </button>
            )}
            <ThemeToggleButton />
            <button onClick={() => setShowLeaveDialog(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-success text-sm font-semibold transition-colors border border-emerald-500/20">
              <LogOut className="h-4 w-4" />
              Submit & Leave
            </button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="flex-1 flex overflow-hidden">
        <ResizablePanel defaultSize="30" maxSize="30" minSize="0" collapsible collapsedSize="0">
          <div className="h-full border-r border-border bg-card flex flex-col overflow-hidden">
            <div className="flex border-b border-border shrink-0">
              {difficultyOrder.map((diff, i) => (
                <button key={diff} onClick={() => setSelectedProblem(i)}
                  className={cn("flex-1 py-3 text-sm font-semibold transition-colors relative", selectedProblem === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <span className={cn(diff === "Easy" && "text-emerald-500", diff === "Medium" && "text-amber-500", diff === "Hard" && "text-rose-500")}>{diff}</span>
                  {selectedProblem === i && <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", diff === "Easy" && "bg-emerald-500", diff === "Medium" && "bg-amber-500", diff === "Hard" && "bg-rose-500")} />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
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
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onCopy={blockClipboard}
                    onCut={blockClipboard}
                    onPaste={blockClipboard}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm bg-card text-foreground focus:outline-none leading-6"
                    spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                    data-gramm="false" data-enable-grammarly="false"
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
                  const diffKey = diff.toLowerCase() as "easy" | "medium" | "hard";
                  const maxPts = diff === "Easy" ? 100 : diff === "Medium" ? 200 : 300;
                  const earned = myProgress[diffKey];
                  return (
                    <div key={diff} className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", diff === "Easy" && "text-success", diff === "Medium" && "text-warning", diff === "Hard" && "text-danger")}>{diff}</span>
                      {earned !== null && earned !== undefined
                        ? <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold font-mono"><CheckCircle2 className="h-3.5 w-3.5" />{earned}/{maxPts}</span>
                        : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono"><Circle className="h-3.5 w-3.5" />0/{maxPts}</span>}
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
