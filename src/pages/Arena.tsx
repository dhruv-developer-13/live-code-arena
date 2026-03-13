import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock, Play, Send,
  CheckCircle2, XCircle, Circle, AlertTriangle,
  LogOut, Trophy, Zap, Sun, Moon,
  Maximize, ShieldAlert, ShieldX,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "../components/ui/resizable";
import problemsData from "../data/problems.json";

//  MOCK API 

async function apiFetchProblems(): Promise<Problem[]> {
  await new Promise((r) => setTimeout(r, 500));
  return problemsData.problems as Problem[];
}
async function apiRun(_code: string, _problemId: number): Promise<{ results: TestResult[] }> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    results: [
      { passed: true,  input: "nums=[2,7,11,15], target=9", expected: "[0,1]", actual: "[0,1]" },
      { passed: false, input: "nums=[3,2,4], target=6",     expected: "[1,2]", actual: "[0,2]" },
    ],
  };
}
async function apiSubmit(_code: string, problemId: number, _roomCode: string): Promise<{ status: "AC" | "WA" | "TLE"; points: number }> {
  await new Promise((r) => setTimeout(r, 1200));
  const passed = Math.random() > 0.4;
  return { status: passed ? "AC" : "WA", points: [100, 200, 300][(problemId - 1) % 3] ?? 100 };
}

//  TYPES 

interface Example { input: string; output: string; explanation?: string; }
interface Problem {
  id: number; difficulty: "Easy" | "Medium" | "Hard";
  title: string; description: string; inputFormat: string;
  outputFormat: string; constraints: string; points: number; examples: Example[];
}
interface TestResult { passed: boolean; input: string; expected: string; actual: string; }
interface Submission { time: string; problem: string; status: "AC" | "WA" | "TLE"; }

//  CONSTANTS 

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";
const TOTAL_SECONDS = 45 * 60;
const PYTHON_STUB = `def solution():\n    # Write your solution here\n    pass\n`;
const MAX_VIOLATIONS = 3;

//  COMPONENT 

export default function BattleArena() {
  const { roomCode = "DEMO" } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  // Theme
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggleTheme = () => { document.documentElement.classList.toggle("dark"); setIsDark((p) => !p); };

  // Problems
  const [problems, setProblems]   = useState<Problem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState(0);

  // Editor
  const [code, setCode] = useState(PYTHON_STUB);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  // Execution
  const [running, setRunning]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Competition
  const [timeLeft, setTimeLeft]     = useState(TOTAL_SECONDS);
  const [myScore, setMyScore]       = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myProgress, setMyProgress] = useState<Record<string, number | null>>({ Easy: null, Medium: null, Hard: null });
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Dialogs
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Score pulse
  const [myScorePulse, setMyScorePulse]   = useState(false);
  const [oppScorePulse, setOppScorePulse] = useState(false);

  //  Anti-cheat state 
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [violations, setViolations]                   = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [violationReason, setViolationReason]         = useState("");
  const violationsRef = useRef(0); // ref so event handlers always see latest value

  //  Enter fullscreen 
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenPrompt(false);
    } catch (_) {
      toast.error("Could not enter fullscreen", { closeButton: true, description: "Please allow fullscreen in your browser." });
    }
  }, []);

  // Try to enter fullscreen on mount; browsers may block this without user interaction.
  useEffect(() => {
    void enterFullscreen();
  }, [enterFullscreen]);

  //  Record a violation 
  const recordViolation = useCallback((reason: string) => {
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    setViolationReason(reason);
    setShowViolationWarning(true);
    toast.error(`⚠️ Violation ${violationsRef.current}/${MAX_VIOLATIONS}`, { closeButton: true, description: reason });
    if (violationsRef.current >= MAX_VIOLATIONS) {
      // Auto-disqualify: navigate away after brief delay so user sees the message
      setTimeout(() => navigate("/"), 2500);
    }
  }, [navigate]);

  //  Fullscreen change listener 
  useEffect(() => {
    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs && !showFullscreenPrompt) {
        // They exited fullscreen mid-battle
        setShowFullscreenPrompt(true);
        recordViolation("You exited fullscreen.");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [recordViolation, showFullscreenPrompt]);

  //  Tab / window visibility 
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) recordViolation("You switched tabs or minimized the window.");
    };
    const onBlur = () => {
      // window blur fires when user Alts to another app
      if (!document.hidden) recordViolation("You switched to another window.");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [recordViolation]);

  //  Block right-click globally 
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  //  Block common screenshot / devtools shortcuts 
  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // PrintScreen
      if (key === "printscreen") { e.preventDefault(); recordViolation("Screenshot attempt detected."); return; }
      // F12 / DevTools
      if (key === "f12") { e.preventDefault(); return; }
      // Ctrl+Shift+I/J/C (devtools), Ctrl+U (source), Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i","j","c"].includes(key)) { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && ["u","s"].includes(key)) { e.preventDefault(); return; }
      // Copy/paste/cut in editor handled separately — block globally elsewhere
    };
    document.addEventListener("keydown", block);
    return () => document.removeEventListener("keydown", block);
  }, [recordViolation]);

  //  Load problems 
  useEffect(() => {
    apiFetchProblems()
      .then((data) => { setProblems(data); setLoading(false); })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }, []);

  //  WebSocket opponent score 
  useEffect(() => {
    if (!roomCode) return;
    let fallback: ReturnType<typeof setInterval>;
    let ws: WebSocket;
    try {
      ws = new WebSocket(`${BASE_URL.replace(/^http/, "ws")}/ws/room/${roomCode}`);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "score") { setOpponentScore(msg.score); setOppScorePulse(true); setTimeout(() => setOppScorePulse(false), 600); }
        } catch (_) {}
      };
      ws.onerror = () => startFallback();
    } catch (_) { startFallback(); }
    function startFallback() {
      fallback = setInterval(() => {
        if (Math.random() > 0.75) {
          setOpponentScore((p) => { const n = p + Math.floor(Math.random() * 60 + 10); setOppScorePulse(true); setTimeout(() => setOppScorePulse(false), 600); return n; });
        }
      }, 6000);
    }
    return () => { ws?.close(); clearInterval(fallback); };
  }, [roomCode]);

  //  Timer 
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(t); navigate(`/results/${roomCode}`); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate, roomCode]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const elapsed = () => formatTime(TOTAL_SECONDS - timeLeft);

  //  Editor anti-cheat 
  const blockClipboard = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error("⚠️ Not allowed", { closeButton: true, description: "Copy/paste is disabled during the contest." });
  }, []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Tab key for indentation 
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = codeRef.current.slice(0, start) + "    " + codeRef.current.slice(end);
      setCode(newCode);
      // Move cursor after the inserted spaces
      requestAnimationFrame(() => {
        textarea.selectionStart = start + 4;
        textarea.selectionEnd = start + 4;
      });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ["c","v","x"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      toast.error("⚠️ Not allowed", { closeButton: true, description: "Copy/paste is disabled during the contest." });
    }
  }, []);

  //  Run 
  const handleRun = async () => {
    if (!problems[selectedProblem]) return;
    setRunning(true); setShowResults(true);
    try {
      const { results } = await apiRun(code, problems[selectedProblem].id);
      setTestResults(results);
      toast(`Executed — ${results.length} test case${results.length !== 1 ? "s" : ""} run`, { closeButton: true });
    } catch (err: any) {
      toast.error("Execution error", { closeButton: true, description: err.message });
    } finally { setRunning(false); }
  };

  //  Submit 
  const handleSubmit = async () => {
    if (!problems[selectedProblem]) return;
    setSubmitting(true);
    const problem = problems[selectedProblem];
    try {
      const result = await apiSubmit(code, problem.id, roomCode);
      setSubmissions((prev) => [{ time: elapsed(), problem: problem.title, status: result.status }, ...prev]);
      if (result.status === "AC") {
        setMyScore((prev) => { const n = prev + result.points; setMyScorePulse(true); setTimeout(() => setMyScorePulse(false), 600); return n; });
        setMyProgress((p) => ({ ...p, [problem.difficulty]: result.points }));
        toast.success("🎉 Accepted!", { closeButton: true, description: `+${result.points} points` });
      } else if (result.status === "TLE") {
        toast.error("⏱ Time Limit Exceeded", { closeButton: true, description: "Your solution was too slow." });
      } else {
        toast.error("✗ Wrong Answer", { closeButton: true, description: "Some test cases failed." });
      }
    } catch (err: any) {
      toast.error("Submit error", { closeButton: true, description: err.message });
    } finally { setSubmitting(false); }
  };

  const isUrgent = timeLeft < 5 * 60;
  const currentProblem = problems[selectedProblem];
  const acceptedIds = new Set(submissions.filter((s) => s.status === "AC").map((s) => s.problem));
  const isCurrentAccepted = currentProblem ? acceptedIds.has(currentProblem.title) : false;
  const difficultyOrder = ["Easy", "Medium", "Hard"] as const;
  const iLeading = myScore >= opponentScore;

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">

      {/*  Fullscreen Prompt Overlay  */}
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
              <p className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" /> {MAX_VIOLATIONS} violations = disqualification</p>
            </div>
            <button
              onClick={enterFullscreen}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
            >
              Enter Fullscreen & Start
            </button>
          </div>
        </div>
      )}

      {/*  Violation Warning Modal  */}
      {showViolationWarning && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowViolationWarning(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              violations >= MAX_VIOLATIONS ? "bg-rose-500/20" : "bg-amber-500/15"
            )}>
              <ShieldX className={cn("h-7 w-7", violations >= MAX_VIOLATIONS ? "text-rose-500" : "text-amber-500")} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">
                {violations >= MAX_VIOLATIONS ? "Disqualified" : `Violation ${violations}/${MAX_VIOLATIONS}`}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{violationReason}</p>
              {violations >= MAX_VIOLATIONS ? (
                <p className="text-xs text-rose-500 font-semibold">You have been disqualified. Redirecting…</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {MAX_VIOLATIONS - violations} more violation{MAX_VIOLATIONS - violations !== 1 ? "s" : ""} will result in disqualification.
                </p>
              )}
            </div>
            {violations < MAX_VIOLATIONS && (
              <button
                onClick={() => { setShowViolationWarning(false); enterFullscreen(); }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
              >
                Return to Fullscreen
              </button>
            )}
          </div>
        </div>
      )}

      {/*  Leave Dialog  */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLeaveDialog(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-7 w-7 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Leave the Arena?</h2>
              <p className="text-sm text-muted-foreground">Your progress will be lost and you'll forfeit the match.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowLeaveDialog(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors">Stay</button>
              <button onClick={() => navigate("/")} className="flex-1 px-4 py-2.5 rounded-lg bg-destructive hover:bg-destructive/80 text-destructive-foreground text-sm font-bold transition-colors">Leave</button>
            </div>
          </div>
        </div>
      )}

      {/*  Top Bar  */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="relative flex items-center h-14 px-6">

          {/* Left: Timer */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-base font-bold transition-all duration-300",
            isUrgent ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 animate-pulse" : "bg-muted text-foreground"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          {/* Center: Score (absolutely centered) */}
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

          {/* Right: Violations badge + Theme + Leave */}
          <div className="ml-auto flex items-center gap-2">
            {/* Violation counter */}
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
              violations === 0 && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
              violations === 1 && "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
              violations >= 2 && "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
            )}>
              <ShieldAlert className="h-3.5 w-3.5" />
              {violations}/{MAX_VIOLATIONS}
            </div>
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Enter fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </button>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowLeaveDialog(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold transition-colors border border-destructive/20">
              <LogOut className="h-4 w-4" />
              Leave
            </button>
          </div>
        </div>
      </div>

      {/*  Main  */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 flex overflow-hidden">

        {/*  Left: Problem  */}
        <ResizablePanel defaultSize="30" maxSize="30" minSize="0" collapsible collapsedSize="0">
          <div
            className="h-full border-r border-border bg-card flex flex-col overflow-hidden"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Difficulty Tabs */}
            <div className="flex border-b border-border shrink-0">
              {difficultyOrder.map((diff, i) => (
                <button
                  key={diff}
                  onClick={() => setSelectedProblem(i)}
                  className={cn("flex-1 py-3 text-sm font-semibold transition-colors relative", selectedProblem === i ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <span className={cn(diff === "Easy" && "text-emerald-500", diff === "Medium" && "text-amber-500", diff === "Hard" && "text-rose-500")}>{diff}</span>
                  {selectedProblem === i && <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", diff === "Easy" && "bg-emerald-500", diff === "Medium" && "bg-amber-500", diff === "Hard" && "bg-rose-500")} />}
                </button>
              ))}
            </div>

            {/* Problem Content */}
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
              {loadError && (
                <div className="flex flex-col items-center justify-center gap-3 h-40 text-destructive">
                  <AlertTriangle className="h-10 w-10" />
                  <p className="text-sm text-center font-medium">{loadError}</p>
                </div>
              )}
              {!loading && !loadError && currentProblem && (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug">{currentProblem.title}</h2>
                    <span className={cn(
                      "shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                      currentProblem.difficulty === "Easy" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      currentProblem.difficulty === "Medium" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      currentProblem.difficulty === "Hard" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                    )}>
                      {currentProblem.points} pts
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentProblem.description}</p>

                  {/* Examples */}
                  <div className="space-y-3">
                    {currentProblem.examples?.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-border overflow-hidden">
                        <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                          <span className="text-xs font-bold text-muted-foreground">Example {i + 1}</span>
                        </div>
                        <div className="p-3 space-y-2 font-mono text-xs">
                          <div><span className="font-bold text-foreground">Input:&nbsp;</span><span className="text-muted-foreground whitespace-pre-wrap">{ex.input}</span></div>
                          <div><span className="font-bold text-foreground">Output:&nbsp;</span><span className="text-muted-foreground">{ex.output}</span></div>
                          {ex.explanation && <div className="pt-1 border-t border-border/50"><span className="font-bold text-foreground">Explanation:&nbsp;</span><span className="text-muted-foreground font-sans">{ex.explanation}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div>
                    <h4 className="text-sm font-bold mb-2">Constraints</h4>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      {currentProblem.constraints.split("\n").map((line, i) => (
                        <p key={i} className="text-xs font-mono text-muted-foreground leading-6"><span className="mr-2 text-foreground">•</span>{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Input / Output Format */}
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

                  {/* Execution note */}
                  <p className="text-xs text-muted-foreground/70 italic border-t border-border/40 pt-3">
                    Note 💡: You must call <code className="font-mono text-foreground/80 not-italic">solution()</code> at the end of your code to execute it.
                  </p>
                </>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/*  Center: Editor  */}
        <ResizablePanel defaultSize="50" minSize="50">
          <div className="h-full flex flex-col min-w-0">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Python 3</span>
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

            {/* Editor + Test Results — vertical resizable split */}
            <ResizablePanelGroup orientation="vertical" className="flex-1 min-h-0">

              {/* Code editor */}
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
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm bg-card text-foreground focus:outline-none leading-6"
                    spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                    data-gramm="false" data-enable-grammarly="false"
                  />
                </div>
              </ResizablePanel>

              {/* Test Results — only shown after Run */}
              {showResults && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize="30" minSize="15" maxSize="50">
                    <div className="h-full flex flex-col border-t border-border bg-card">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Test Results</span>
                          <span className="text-xs text-muted-foreground">
                            {testResults.filter((r) => r.passed).length}/{testResults.length} passed
                          </span>
                        </div>
                        <button
                          onClick={() => setShowResults(false)}
                          className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="Close test results"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Results list */}
                      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {testResults.map((r, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-xl border p-3 text-xs font-mono space-y-1.5",
                              r.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {r.passed
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                : <XCircle className="h-4 w-4 text-rose-500" />}
                              <span className={cn(
                                "font-bold font-sans text-xs",
                                r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              )}>
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

        {/*  Right: Competition Panel  */}
        <ResizablePanel defaultSize="20" minSize="20" maxSize="20">
          <div className="h-full border-l border-border bg-card flex flex-col">

            {/* Live Score */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">Live Score</h3>
              </div>
              <div className="space-y-3">
                {/* You */}
                <div className={cn("relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500", iLeading ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]" : "bg-muted/50 border-border")}>
                  {iLeading && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />}
                  <div className="flex items-center gap-2">{iLeading && <Trophy className="h-3.5 w-3.5 text-emerald-500" />}<span className="font-semibold text-sm">You</span></div>
                  <span className={cn("font-black font-mono text-xl transition-all duration-300", iLeading ? "text-emerald-500" : "text-foreground", myScorePulse && "scale-125")}>{myScore}</span>
                </div>
                {/* Opponent */}
                <div className={cn("relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500", !iLeading ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]" : "bg-muted/50 border-border")}>
                  {!iLeading && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />}
                  <div className="flex items-center gap-2">{!iLeading && <Trophy className="h-3.5 w-3.5 text-rose-500" />}<span className="font-semibold text-sm">Opponent</span></div>
                  <span className={cn("font-black font-mono text-xl transition-all duration-300", !iLeading ? "text-rose-500" : "text-foreground", oppScorePulse && "scale-125")}>{opponentScore}</span>
                </div>
                {/* Score bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  {myScore + opponentScore > 0 && (
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${(myScore / (myScore + opponentScore)) * 100}%` }} />
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-sm mb-4">Your Progress</h3>
              <div className="space-y-2.5">
                {difficultyOrder.map((diff) => {
                  const maxPts = { Easy: 100, Medium: 200, Hard: 300 }[diff];
                  const earned = myProgress[diff];
                  return (
                    <div key={diff} className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", diff === "Easy" && "text-emerald-600 dark:text-emerald-400", diff === "Medium" && "text-amber-600 dark:text-amber-400", diff === "Hard" && "text-rose-600 dark:text-rose-400")}>{diff}</span>
                      {earned !== null
                        ? <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold font-mono"><CheckCircle2 className="h-3.5 w-3.5" />{earned}/{maxPts}</span>
                        : <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono"><Circle className="h-3.5 w-3.5" />0/{maxPts}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submissions */}
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
                      <span className={cn("font-black font-mono text-xs px-2 py-0.5 rounded-md", sub.status === "AC" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", sub.status === "WA" && "bg-rose-500/15 text-rose-600 dark:text-rose-400", sub.status === "TLE" && "bg-amber-500/15 text-amber-600 dark:text-amber-400")}>{sub.status}</span>
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