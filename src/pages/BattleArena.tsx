import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate,useSearchParams } from "react-router-dom";
import {
  Clock,Play,Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Circle,
  AlertTriangle,
  LogOut,
  Trophy,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import problemsData from "../data/problems.json";
import { runBatch, judgeResults, type JudgedResult } from "../lib/executor"
import { io, Socket } from "socket.io-client"
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
  drawSelection,
} from "@codemirror/view";

import { EditorView } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";


async function apiFetchProblems(): Promise<Problem[]> {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return problemsData.problems as Problem[];
}

// async function apiRun(
//   code: string,
//   problemId: number,
// ): Promise<{ results: TestResult[] }> {
//   await new Promise((r) => setTimeout(r, 1000));
//   return {
//     results: [
//       {
//         passed: true,
//         input: "nums=[2,7,11,15], target=9",
//         expected: "[0,1]",
//         actual: "[0,1]",
//       },
//       {
//         passed: false,
//         input: "nums=[3,2,4], target=6",
//         expected: "[1,2]",
//         actual: "[0,2]",
//       },
//     ],
//   };
// }

// async function apiSubmit(
//   code: string,
//   problemId: number,
//   roomCode: string,
// ): Promise<{ status: "AC" | "WA" | "TLE"; points: number }> {
//   await new Promise((r) => setTimeout(r, 1200));
//   const passed = Math.random() > 0.4;
//   return {
//     status: passed ? "AC" : "WA",
//     points: [100, 200, 300][problemId - 1] ?? 100,
//   };
// }
// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string
  expected: string
}
interface Problem {
  id: number;
  difficulty: "Easy" | "Medium" | "Hard";
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  points: number;
  examples: Example[];
  testCases: TestCase[];
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

interface Submission {
  time: string;
  problem: string;
  status: "AC" | "WA" | "TLE";
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

// async function apiFetchProblems(): Promise<Problem[]> {
//   const res = await fetch(`${BASE_URL}/api/problems`);
//   if (!res.ok) throw new Error(`Failed to load problems (${res.status})`);
//   const data = await res.json();
//   return data.problems;
// }

// async function apiRun(code: string, problemId: number): Promise<{ results: TestResult[] }> {
//   const res = await fetch(`${BASE_URL}/api/run`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ code, language: "Python", problemId }),
//   });
//   if (!res.ok) throw new Error(`Run failed (${res.status})`);
//   return res.json();
// }

// async function apiSubmit(
//   code: string,
//   problemId: number,
//   roomCode: string
// ): Promise<{ status: "AC" | "WA" | "TLE"; points: number }> {
//   const res = await fetch(`${BASE_URL}/api/submit`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ code, language: "Python", problemId, roomCode }),
//   });
//   if (!res.ok) throw new Error(`Submit failed (${res.status})`);
//   return res.json();
// }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TOTAL_SECONDS = 45 * 60;
const PYTHON_STUB = `def solution():\n    # Write your solution here\n    pass\n`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function BattleArena() {
  const { roomCode = "DEMO" } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  // Theme toggle
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((prev) => !prev);
  };

  // Problems
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState(0);

  // Editor
  const [code, setCode] = useState(PYTHON_STUB);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Execution
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Competition
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myProgress, setMyProgress] = useState<Record<string, number | null>>({
    Easy: null,
    Medium: null,
    Hard: null,
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Leave confirm
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Score animation pulse
  const [myScorePulse, setMyScorePulse] = useState(false);
  const [oppScorePulse, setOppScorePulse] = useState(false);

  const socketRef = useRef<Socket | null>(null)

  //reading url
  const [searchParams] = useSearchParams()
  const username = searchParams.get("username") ?? "player1"
  const userId = searchParams.get("userId") ?? "1"

  //tabswitching
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  // ── Load problems
  useEffect(() => {
    apiFetchProblems()
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, []);

  // ── WebSocket opponent score
//  useEffect(() => {
//   const socket = io("http://localhost:3000")
//   socketRef.current = socket

//   socket.on("connect", () => {
//     console.log("Socket connected")
//     socket.on("connect", () => {
//   socket.emit("join_room", { roomCode, userId: socket.id })
// })
//   })

//   socket.on("opponent_score", ({ score }: { score: number }) => {
//     setOpponentScore(score)
//     setOppScorePulse(true)
//     setTimeout(() => setOppScorePulse(false), 600)
//   })

//   return () => {
//     socket.disconnect()
//   }
// }, [roomCode])

  // ── Timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          navigate(`/results/${roomCode}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate, roomCode]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const elapsed = () => formatTime(TOTAL_SECONDS - timeLeft);

  // ── Anti-cheat
  // const blockClipboard = useCallback((e: React.ClipboardEvent) => {
  //   e.preventDefault();
  //   toast.error("⚠️ Not allowed", {
  //     description: "Copy/paste is disabled during the contest.",
  //   });
  // }, []);

  // const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  //   if (
  //     (e.ctrlKey || e.metaKey) &&
  //     ["c", "v", "x"].includes(e.key.toLowerCase())
  //   ) {
  //     e.preventDefault();
  //     toast.error("⚠️ Not allowed", {
  //       description: "Copy/paste is disabled during the contest.",
  //     });
  //   }
  // }, []);



const handleSubmit = useCallback(async () => {
  if (!problems[selectedProblem]) return
  setSubmitting(true)
  const problem = problems[selectedProblem]!

  try {
    const testCases = problem.testCases
    const raw = await runBatch({ code, testCases })
    const judged = judgeResults(raw, testCases)

    const passed = judged.filter((j) => j.passed).length
    const total = judged.length
    const scoreEarned = Math.round((passed / total) * problem.points)

    const status: "AC" | "WA" | "TLE" = judged.some((j) => j.status === "TLE")
      ? "TLE"
      : passed === total ? "AC" : "WA"

    setSubmissions((prev) => [
      { time: elapsed(), problem: problem.title, status },
      ...prev,
    ])

    if (scoreEarned > 0) {
      setMyScore((prev) => {
        const next = prev + scoreEarned
        setMyScorePulse(true)
        setTimeout(() => setMyScorePulse(false), 600)
        socketRef.current?.emit("score_update", {
          roomCode,
          userId: username,
          score: next
        })
        return next
      })
      setMyProgress((p) => ({ ...p, [problem.difficulty]: scoreEarned }))

      if (status === "AC") {
        toast.success("🎉 Accepted!", { description: `+${scoreEarned} points` })
      } else {
        toast(`${passed}/${total} passed`, { description: `+${scoreEarned} points earned` })
      }
    } else if (status === "TLE") {
      toast.error("⏱ Time Limit Exceeded", { description: "Your solution was too slow." })
    } else {
      toast.error("✗ Wrong Answer", { description: `0/${total} test cases passed.` })
    }

  } catch (err: any) {
    toast.error("Submit error", { description: err.message })
  } finally {
    setSubmitting(false)
  }
}, [problems, selectedProblem, code, roomCode, username, myScore, elapsed])



//deducting points
const deductPoints = useCallback((reason: string) => {
  setMyScore((prev) => {
    const next = Math.max(0, prev - 50)  // never go below 0
    setMyScorePulse(true)
    setTimeout(() => setMyScorePulse(false), 600)
    socketRef.current?.emit("score_update", {
      roomCode,
      userId: username,
      score: next
    })
    toast.error(`-50 points`, { description: reason })
    return next
  })
}, [roomCode, username])

// prevent tab switching
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      deductPoints("Tab switching detected")
      setTabSwitchCount((prev) => {
        const next = prev + 1
        if (next >= 3) {
          toast.error("🚨 Disqualified!", {
            description: "Too many tab switches. Auto-submitting.",
          })
          handleSubmit()
          setTimeout(() => navigate(`/results/${roomCode}`), 2000)
        }
        return next
      })
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange)
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
}, [deductPoints, handleSubmit, navigate, roomCode])

// preventing screenshots / focus loss
useEffect(() => {
  const handleBlur = () => {
    document.documentElement.style.filter = "blur(8px)"
    deductPoints("Screen focus lost — possible screenshot attempt")
  }

  const handleFocus = () => {
    document.documentElement.style.filter = ""
  }

  window.addEventListener("blur", handleBlur)
  window.addEventListener("focus", handleFocus)

  return () => {
    window.removeEventListener("blur", handleBlur)
    window.removeEventListener("focus", handleFocus)
    document.documentElement.style.filter = ""
  }
}, [deductPoints])




 

const handleRun = async () => {
  if (!problems[selectedProblem]) return
  setRunning(true)
  setShowResults(true)

  try {
    const testCases = problems[selectedProblem]!.testCases
    const raw = await runBatch({ code, testCases })
    const judged = judgeResults(raw, testCases)

    const results: TestResult[] = judged.map((j) => ({
      passed: j.passed,
      input: testCases[j.testCase - 1]!.input,
      expected: j.expected,
      actual: j.yourOutput || "(no output)",
    }))

    setTestResults(results)
    toast(`Executed — ${results.length} test case${results.length !== 1 ? "s" : ""} run`)
  } catch (err: any) {
    toast.error("Execution error", { description: err.message })
  } finally {
    setRunning(false)
  }
}






// enter fullscreen when battle starts
const [isFullscreen, setIsFullscreen] = useState(false)
const enterFullscreen = async () => {
  try {
    await document.documentElement.requestFullscreen()
    setIsFullscreen(true)
  } catch (err) {
    toast.error("Fullscreen not supported")
  }
}
useEffect(() => {
  if (!isFullscreen) return

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      deductPoints("Fullscreen exit detected")
      setTabSwitchCount((prev) => {
        const next = prev + 1
        if (next >= 3) {
          toast.error("🚨 Disqualified!", { description: "Too many fullscreen exits." })
          handleSubmit()
          setTimeout(() => navigate(`/results/${roomCode}`), 2000)
        } else {
          toast.error(`⚠️ Warning ${next}/3`, { description: "Exiting fullscreen is not allowed." })
          // document.documentElement.requestFullscreen()
        }
        return next
      })
    }
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange)
  return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
}, [isFullscreen, navigate, roomCode, handleSubmit, deductPoints])

  const isUrgent = timeLeft < 5 * 60;
  const currentProblem = problems[selectedProblem];
  const acceptedIds = new Set(
    submissions.filter((s) => s.status === "AC").map((s) => s.problem),
  );
  const isCurrentAccepted = currentProblem
    ? acceptedIds.has(currentProblem.title)
    : false;
  const difficultyOrder = ["Easy", "Medium", "Hard"] as const;
  const iLeading = myScore >= opponentScore;





  
  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      {!isFullscreen && (
  <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center gap-6">
    <h2 className="text-2xl font-bold">Ready to Battle?</h2>
    <p className="text-muted-foreground text-sm">Fullscreen mode is required to prevent cheating.</p>
    <button
      onClick={enterFullscreen}
      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm"
    >
      Enter Fullscreen & Start
    </button>
  </div>
)}
      {/* ── Leave Dialog ─────────────────────────────────────────────────── */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLeaveDialog(false)}
          />
          <div className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-7 w-7 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Leave the Arena?</h2>
              <p className="text-sm text-muted-foreground">
                Your progress will be lost and you'll forfeit the match. Your
                opponent will be declared the winner.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLeaveDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-2.5 rounded-lg bg-destructive hover:bg-destructive/80 text-destructive-foreground text-sm font-bold transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-6 gap-4">
          {/* Timer */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all duration-300",
              isUrgent
                ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 animate-pulse"
                : "bg-muted text-foreground",
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>

          {/* Score */}
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "flex flex-col items-center px-5 py-1.5 rounded-xl transition-all duration-300",
                iLeading
                  ? "bg-emerald-500/15 ring-1 ring-emerald-500/40"
                  : "bg-muted",
              )}
            >
              <span className="text-xs text-muted-foreground font-medium">
                You
              </span>
              <span
                className={cn(
                  "text-2xl font-black font-mono transition-all duration-300",
                  iLeading ? "text-emerald-500" : "text-foreground",
                  myScorePulse && "scale-125",
                )}
              >
                {myScore}
              </span>
            </div>

            <span className="text-muted-foreground text-lg font-bold">vs</span>

            <div
              className={cn(
                "flex flex-col items-center px-5 py-1.5 rounded-xl transition-all duration-300",
                !iLeading
                  ? "bg-rose-500/15 ring-1 ring-rose-500/40"
                  : "bg-muted",
              )}
            >
              <span className="text-xs text-muted-foreground font-medium">
                Opponent
              </span>
              <span
                className={cn(
                  "text-2xl font-black font-mono transition-all duration-300",
                  !iLeading ? "text-rose-500" : "text-foreground",
                  oppScorePulse && "scale-125",
                )}
              >
                {opponentScore}
              </span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground text-sm font-semibold transition-colors border border-border"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDark ? "Light" : "Dark"}
          </button>
          {/* Leave button */}
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold transition-colors border border-destructive/20"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </button>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 flex overflow-hidden">
        {/* ── Left: Problem ────────────────────────────────────────────── */}
        <ResizablePanel defaultSize="30" maxSize="30" minSize="0" collapsible collapsedSize="0">
        <div className="h-full border-r border-border bg-card flex flex-col overflow-hidden"

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
                className={cn(
                  "flex-1 py-3 text-sm font-semibold transition-colors relative",
                  selectedProblem === i
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    diff === "Easy" && "text-emerald-500",
                    diff === "Medium" && "text-amber-500",
                    diff === "Hard" && "text-rose-500",
                  )}
                >
                  {diff}
                </span>
                {selectedProblem === i && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5",
                      diff === "Easy" && "bg-emerald-500",
                      diff === "Medium" && "bg-amber-500",
                      diff === "Hard" && "bg-rose-500",
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Problem Content */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-5"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          >
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
                {/* Title + badge */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold leading-snug">
                    {currentProblem.title}
                  </h2>
                  <span
                    className={cn(
                      "shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                      currentProblem.difficulty === "Easy" &&
                        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      currentProblem.difficulty === "Medium" &&
                        "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      currentProblem.difficulty === "Hard" &&
                        "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {currentProblem.points} pts
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentProblem.description}
                </p>

                {/* Examples — LeetCode style */}
                <div className="space-y-3">
                  {currentProblem.examples?.map((ex, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border overflow-hidden"
                    >
                      <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                        <span className="text-xs font-bold text-muted-foreground">
                          Example {i + 1}
                        </span>
                      </div>
                      <div className="p-3 space-y-2 font-mono text-xs">
                        <div>
                          <span className="font-bold text-foreground">
                            Input:&nbsp;
                          </span>
                          <span className="text-muted-foreground whitespace-pre-wrap">
                            {ex.input}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-foreground">
                            Output:&nbsp;
                          </span>
                          <span className="text-muted-foreground">
                            {ex.output}
                          </span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-1 border-t border-border/50">
                            <span className="font-bold text-foreground">
                              Explanation:&nbsp;
                            </span>
                            <span className="text-muted-foreground font-sans">
                              {ex.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <h4 className="text-sm font-bold mb-2">Constraints</h4>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    {currentProblem.constraints.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-xs font-mono text-muted-foreground leading-6"
                      >
                        <span className="mr-2 text-foreground">•</span>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Input / Output Format */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                      <span className="text-xs font-bold text-muted-foreground">
                        Input Format
                      </span>
                    </div>
                    <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {currentProblem.inputFormat}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-3 py-1.5 bg-muted/50 border-b border-border">
                      <span className="text-xs font-bold text-muted-foreground">
                        Output Format
                      </span>
                    </div>
                    <pre className="p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {currentProblem.outputFormat}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/* ── Center: Editor ────────────────────────────────────────────── */}
        <ResizablePanel defaultSize="50" minSize="50">
        <div className="h-full flex flex-col min-w-0">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30 shrink-0">
            {/* Language badge — Python only */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Python 3
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={running || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                {running ? "Running…" : "Run"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || loading || isCurrentAccepted}
                title={isCurrentAccepted ? "Already solved!" : undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
                {isCurrentAccepted
                  ? "Solved ✓"
                  : submitting
                    ? "Submitting…"
                    : "Submit"}
              </button>
            </div>
          </div>

          {/* Code editor — CodeMirror 6 with Python syntax highlighting */}
          <div className="flex-1 min-h-0 overflow-hidden" style={{ display: "flex", flexDirection: "column" }}>
              <CodeMirror
                value={code}
                height="100%"
                theme={oneDark}
                extensions={[
                  python(),

                  lineNumbers(),
                  highlightActiveLineGutter(),
                  highlightActiveLine(),
                  drawSelection(),

                  keymap.of(defaultKeymap),

                  EditorView.theme({
                    "&": {
                      fontSize: "14px",
                    },
                    ".cm-content": {
                      padding: "12px",
                    },
                    ".cm-line": {
                      lineHeight: "1.6",
                    },
                    ".cm-gutters": {
                      backgroundColor: "#0f172a", // dark gutter like VS Code
                      color: "#6b7280",
                      border: "none",
                    },
                  }),
                ]}
                onChange={(value) => setCode(value)}
                style={{ height: "100%", width: "100%" }}
              />
          </div>
          
          {/* Test Results */}
          {showResults && (
            <div className="border-t border-border bg-card shrink-0">
              <button
                onClick={() => setShowResults((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Test Results</span>
                  <span className="text-xs text-muted-foreground">
                    {testResults.filter((r) => r.passed).length}/
                    {testResults.length} passed
                  </span>
                </div>
                {showResults ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
              <div className="px-4 pb-4 space-y-2 max-h-52 overflow-y-auto">
                {testResults.map((r, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border p-3 text-xs font-mono space-y-1.5",
                      r.passed
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )}
                      <span
                        className={cn(
                          "font-bold font-sans text-xs",
                          r.passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        Case {i + 1}: {r.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                    <p>
                      <span className="text-muted-foreground">Input: </span>
                      {r.input}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Expected: </span>
                      {r.expected}
                    </p>
                    {!r.passed && (
                      <p>
                        <span className="text-muted-foreground">Actual: </span>
                        {r.actual}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </ResizablePanel>
        <ResizableHandle />

        {/* ── Right: Competition Panel ──────────────────────────────────── */}
        <ResizablePanel defaultSize="20" minSize="20" maxSize="20">
        <div className="h-full border-l border-border bg-card flex flex-col">
          {/* Live Score with animation */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-sm">Live Score</h3>
            </div>
            <div className="space-y-3">
              {/* You */}
              <div
                className={cn(
                  "relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500",
                  iLeading
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "bg-muted/50 border-border",
                )}
              >
                {iLeading && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                )}
                <div className="flex items-center gap-2">
                  {iLeading && (
                    <Trophy className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  <span className="font-semibold text-sm">You</span>
                </div>
                <span
                  className={cn(
                    "font-black font-mono text-xl transition-all duration-300",
                    iLeading ? "text-emerald-500" : "text-foreground",
                    myScorePulse && "scale-125",
                  )}
                >
                  {myScore}
                </span>
              </div>

              {/* Opponent */}
              <div
                className={cn(
                  "relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500",
                  !iLeading
                    ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                    : "bg-muted/50 border-border",
                )}
              >
                {!iLeading && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                )}
                <div className="flex items-center gap-2">
                  {!iLeading && (
                    <Trophy className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span className="font-semibold text-sm">Opponent</span>
                </div>
                <span
                  className={cn(
                    "font-black font-mono text-xl transition-all duration-300",
                    !iLeading ? "text-rose-500" : "text-foreground",
                    oppScorePulse && "scale-125",
                  )}
                >
                  {opponentScore}
                </span>
              </div>

              {/* Score bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                {myScore + opponentScore > 0 && (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                    style={{
                      width: `${(myScore / (myScore + opponentScore)) * 100}%`,
                    }}
                  />
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
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        diff === "Easy" &&
                          "text-emerald-600 dark:text-emerald-400",
                        diff === "Medium" &&
                          "text-amber-600 dark:text-amber-400",
                        diff === "Hard" && "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {diff}
                    </span>
                    {earned !== null ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {earned}/{maxPts}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                        <Circle className="h-3.5 w-3.5" />
                        0/{maxPts}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submissions */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-bold text-sm mb-4">Submissions</h3>
            <div className="space-y-2">
              {submissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No submissions yet
                </p>
              ) : (
                submissions.map((sub, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50 text-xs border border-border"
                  >
                    <div>
                      <p className="font-semibold text-foreground leading-snug">
                        {sub.problem}
                      </p>
                      <p className="text-muted-foreground mt-0.5">{sub.time}</p>
                    </div>
                    <span
                      className={cn(
                        "font-black font-mono text-xs px-2 py-0.5 rounded-md",
                        sub.status === "AC" &&
                          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        sub.status === "WA" &&
                          "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                        sub.status === "TLE" &&
                          "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
