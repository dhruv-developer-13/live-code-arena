import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Trophy, Plus, Share2, Swords, Home,
  Brain, Send, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, Bot, User,
  CheckCircle2, XCircle, Clock, TrendingUp,
  Target, BarChart3, Zap,
} from "lucide-react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/PageBackground";
import { cn } from "@/lib/utils";
import { CardContainer } from "@/components/ui/card-container";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface QuestionResult {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  yourScore: number;
  opponentScore: number;
  maxScore: number;
  testsPassed: { you: number; opponent: number; total: number };
  bestTime: { you: string | null; opponent: string | null };
  yourCode?: string;
  opponentCode?: string;
}

interface AIAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  qualityScore: number;
  strengths: string[];
  improvements: string[];
  verdict: string;
}

interface ProblemAIResult {
  title: string;
  you: AIAnalysis | null;
  opponent: AIAnalysis | null;
  comparison: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── AI HELPERS ───────────────────────────────────────────────────────────────

const AI_BASE = "http://localhost:3000";

async function analyzeWithAI(results: QuestionResult[]): Promise<ProblemAIResult[]> {
  const prompt = `You are a competitive programming judge. Analyze the following code submissions from a head-to-head coding battle.

For each problem, analyze BOTH players' code and return a JSON array. Be concise and honest.

Problems and submissions:
${results.map((r, i) => `
Problem ${i + 1}: "${r.title}" (${r.difficulty}, max ${r.maxScore} pts)
Player 1 score: ${r.yourScore}/${r.maxScore}, tests: ${r.testsPassed.you}/${r.testsPassed.total}
Player 1 code:
\`\`\`python
${r.yourCode || "# No submission"}
\`\`\`
Player 2 score: ${r.opponentScore}/${r.maxScore}, tests: ${r.testsPassed.opponent}/${r.testsPassed.total}
Player 2 code:
\`\`\`python
${r.opponentCode || "# No submission"}
\`\`\`
`).join("\n---\n")}

Return ONLY a valid JSON array (no markdown, no explanation):
[{"title":"...","you":{"timeComplexity":"O(n)","spaceComplexity":"O(n)","qualityScore":8,"strengths":["..."],"improvements":["..."],"verdict":"..."},"opponent":{"timeComplexity":"O(n²)","spaceComplexity":"O(1)","qualityScore":5,"strengths":["..."],"improvements":["..."],"verdict":"..."},"comparison":"..."}]`;

  try {
    const res   = await fetch(`${AI_BASE}/ai/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    const { text } = await res.json();
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as ProblemAIResult[];
  } catch { return []; }
}

async function chatWithAI(
  messages: ChatMessage[],
  context: { results: QuestionResult[]; aiAnalysis: ProblemAIResult[]; myTotal: number; opponentTotal: number },
  onChunk: (chunk: string) => void,
): Promise<void> {
  const system = `You are a competitive programming coach reviewing a just-completed head-to-head coding battle.
Battle: Player 1 scored ${context.myTotal} pts, Player 2 scored ${context.opponentTotal} pts.
Problems: ${context.results.map(r => `${r.title} (${r.difficulty}) — you: ${r.yourScore}/${r.maxScore} (${r.testsPassed.you}/${r.testsPassed.total} tests), opponent: ${r.opponentScore}/${r.maxScore} (${r.testsPassed.opponent}/${r.testsPassed.total} tests)`).join("; ")}.
AI insights: ${context.aiAnalysis.map(a => `${a.title}: you ${a.you?.timeComplexity ?? "N/A"} time / ${a.you?.qualityScore ?? "N/A"} quality, opponent ${a.opponent?.timeComplexity ?? "N/A"} / ${a.opponent?.qualityScore ?? "N/A"}. ${a.comparison}`).join(" | ")}.
Answer questions about grading, code quality, or improvements. Be direct. Under 150 words.`;

  const response = await fetch(`${AI_BASE}/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system, messages }) });
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try { onChunk(JSON.parse(payload).chunk); } catch { /* skip */ }
    }
  }
}

// ─── DIFFICULTY CONFIG ────────────────────────────────────────────────────────

const DIFF = {
  Easy:   { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
  Medium: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   bar: "bg-amber-500"   },
  Hard:   { color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",     bar: "bg-rose-500"    },
} as const;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Results() {
  const { roomCode }  = useParams<{ roomCode: string }>();
  const navigate      = useNavigate();
  const location      = useLocation();
  const results: QuestionResult[] = location.state?.results ?? [];

  // If no results were passed (e.g. direct URL navigation), redirect to home
  useEffect(() => {
    if (!location.state?.results) navigate("/", { replace: true });
  }, []);

  const myTotal       = results.reduce((s, r) => s + r.yourScore, 0);
  const opponentTotal = results.reduce((s, r) => s + r.opponentScore, 0);
  const isWinner      = myTotal > opponentTotal;
  const isTie         = myTotal === opponentTotal;
  const maxPossible   = results.reduce((s, r) => s + r.maxScore, 0);

  const [aiAnalysis, setAiAnalysis]   = useState<ProblemAIResult[]>([]);
  const [aiLoading, setAiLoading]     = useState(true);
  const [aiError, setAiError]         = useState(false);
  const [expandedProblem, setExpandedProblem] = useState<number | null>(0);

  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I've reviewed your battle. Ask me anything about the grading, your code quality, or how to improve." },
  ]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    analyzeWithAI(results).then(setAiAnalysis).catch(() => setAiError(true)).finally(() => setAiLoading(false));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatLoading(true);
    setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);
    try {
      await chatWithAI(newMessages, { results, aiAnalysis, myTotal, opponentTotal }, (chunk) => {
        setChatMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      });
    } catch {
      setChatMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Something went wrong. Try again." }; return u; });
    } finally { setChatLoading(false); }
  };

  const handleShare = () => {
    const text = `I just ${isWinner ? "won" : isTie ? "tied" : "lost"} a CodeArena battle! ${myTotal} vs ${opponentTotal}`;
    if (navigator.share) navigator.share({ title: "CodeArena Result", text });
    else navigator.clipboard.writeText(text);
  };

  const solved  = results.filter(r => r.yourScore > 0).length;
  const avgQuality = aiAnalysis.length > 0
    ? Math.round(aiAnalysis.reduce((s, a) => s + (a.you?.qualityScore ?? 0), 0) / aiAnalysis.length * 10) / 10
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Background */}
      <PageBackground
        gridOpacityClass="opacity-30"
        glowSize="compact"
        glowTone={isWinner ? "emerald" : isTie ? "amber" : "rose"}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── HERO ROW ────────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 items-stretch">

          {/* Outcome card — spans 2 cols */}
          <div className={cn(
            "lg:col-span-2 rounded-2xl border p-8 flex flex-col justify-between relative overflow-hidden",
            isWinner ? "bg-emerald-500/5 border-emerald-500/20"
            : isTie   ? "bg-amber-500/5 border-amber-500/20"
            :            "bg-rose-500/5 border-rose-500/20"
          )}>
            {/* Decorative corner */}
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
                    : isTie   ? "bg-amber-500/15 border border-amber-500/30"
                    :            "bg-rose-500/15 border border-rose-500/30"
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
                  : isTie   ? "A perfectly matched battle. Neither player could pull ahead."
                  :            "Your opponent had the edge this time. Study the breakdown below."}
                </p>
              </div>

              {/* Score comparison */}
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

            {/* Score bar */}
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

          {/* Right stat column */}
          <div className="flex flex-col gap-4">
            {/* Problems solved */}
            <CardContainer className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problems Solved</span>
              </div>
              <div>
                <p className="text-5xl font-black tabular-nums text-foreground">{solved}<span className="text-2xl text-muted-foreground font-bold">/{results.length}</span></p>
                <div className="flex gap-1.5 mt-3">
                  {results.map((r, i) => (
                    <div key={i} className={cn(
                      "flex-1 h-1.5 rounded-full",
                      r.yourScore > 0 ? DIFF[r.difficulty].bar : "bg-muted"
                    )} />
                  ))}
                </div>
              </div>
            </CardContainer>

            {/* AI quality score */}
            <CardContainer className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code Quality</span>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analysing…</span>
                </div>
              ) : avgQuality !== null ? (
                <div>
                  <p className="text-5xl font-black tabular-nums text-foreground">{avgQuality}<span className="text-2xl text-muted-foreground font-bold">/10</span></p>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-3">
                    <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${avgQuality * 10}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable</p>
              )}
            </CardContainer>
          </div>
        </div>

        {/* ── PROBLEM BREAKDOWN ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Problem Breakdown</h2>
          </div>

          <div className="space-y-3">
            {results.map((result, i) => {
              const ai           = aiAnalysis[i];
              const isExpanded   = expandedProblem === i;
              const youWon       = result.yourScore > result.opponentScore;
              const tied         = result.yourScore === result.opponentScore;
              const diff         = DIFF[result.difficulty];
              const yourPct      = result.maxScore > 0 ? (result.yourScore / result.maxScore) * 100 : 0;
              const oppPct       = result.maxScore > 0 ? (result.opponentScore / result.maxScore) * 100 : 0;

              return (
                <CardContainer key={i} padded="none">
                  {/* Header row — always visible */}
                  <button
                    onClick={() => setExpandedProblem(isExpanded ? null : i)}
                    className="w-full flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors text-left"
                  >
                    {/* Difficulty pill */}
                    <div className={cn("shrink-0 px-3 py-1 rounded-lg text-xs font-bold border", diff.bg, diff.border, diff.color)}>
                      {result.difficulty}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className={cn("h-3 w-3", result.testsPassed.you === result.testsPassed.total ? "text-emerald-500" : "text-muted-foreground")} />
                          {result.testsPassed.you}/{result.testsPassed.total} tests
                        </span>
                        {result.bestTime.you && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{result.bestTime.you}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="w-48 shrink-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-14 text-right font-mono">{result.yourScore}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", youWon ? "bg-emerald-500" : tied ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${yourPct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-14 text-right font-mono">{result.opponentScore}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", !youWon && !tied ? "bg-emerald-500" : "bg-muted-foreground/30")} style={{ width: `${oppPct}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Score label */}
                    <div className="shrink-0 text-right w-20">
                      <p className="text-lg font-black font-mono">
                        <span className={youWon ? "text-emerald-400" : tied ? "text-foreground" : "text-rose-400"}>{result.yourScore}</span>
                        <span className="text-muted-foreground/40 mx-1 text-sm">·</span>
                        <span className={!youWon && !tied ? "text-emerald-400" : "text-muted-foreground"}>{result.opponentScore}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">of {result.maxScore}</p>
                    </div>

                    {/* Expand chevron */}
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Expanded AI analysis */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-6 py-5 space-y-5">

                      {/* Test result row */}
                      <div className="grid grid-cols-2 gap-3">
                        <CardContainer variant={result.testsPassed.you === result.testsPassed.total ? "default" : "muted"} padded="md" className={result.testsPassed.you === result.testsPassed.total ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Your Tests</p>
                          <p className="text-2xl font-black font-mono">
                            <span className={result.testsPassed.you === result.testsPassed.total ? "text-emerald-400" : "text-rose-400"}>{result.testsPassed.you}</span>
                            <span className="text-muted-foreground text-lg">/{result.testsPassed.total}</span>
                          </p>
                        </CardContainer>
                        <CardContainer variant={result.testsPassed.opponent === result.testsPassed.total ? "default" : "muted"} padded="md" className={result.testsPassed.opponent === result.testsPassed.total ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Opponent's Tests</p>
                          <p className="text-2xl font-black font-mono">
                            <span className={result.testsPassed.opponent === result.testsPassed.total ? "text-emerald-400" : "text-amber-400"}>{result.testsPassed.opponent}</span>
                            <span className="text-muted-foreground text-lg">/{result.testsPassed.total}</span>
                          </p>
                        </CardContainer>
                      </div>

                      {/* AI analysis */}
                      {aiLoading ? (
                        <div className="flex items-center gap-2 py-4 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                          <span className="text-sm">AI is reviewing your code…</span>
                        </div>
                      ) : aiError || !ai ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">AI analysis unavailable</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Side by side analysis */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* You */}
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-400">Your Code</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                    <div className={cn("h-full rounded-full", (ai.you?.qualityScore ?? 0) >= 7 ? "bg-emerald-500" : (ai.you?.qualityScore ?? 0) >= 4 ? "bg-amber-500" : "bg-rose-500")}
                                      style={{ width: `${(ai.you?.qualityScore ?? 0) * 10}%` }} />
                                  </div>
                                  <span className="text-xs font-bold font-mono text-foreground">{ai.you?.qualityScore ?? "—"}/10</span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border font-mono font-bold">⏱ {ai.you?.timeComplexity ?? "—"}</span>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border font-mono font-bold">💾 {ai.you?.spaceComplexity ?? "—"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{ai.you?.verdict}</p>
                              {ai.you && ai.you.improvements.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-amber-400 mb-1.5">To improve</p>
                                  {ai.you.improvements.map((s, j) => (
                                    <p key={j} className="text-xs text-muted-foreground flex gap-1.5 mb-1">
                                      <Zap className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />{s}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Opponent */}
                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-purple-400">Opponent's Code</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                    <div className={cn("h-full rounded-full", (ai.opponent?.qualityScore ?? 0) >= 7 ? "bg-emerald-500" : (ai.opponent?.qualityScore ?? 0) >= 4 ? "bg-amber-500" : "bg-rose-500")}
                                      style={{ width: `${(ai.opponent?.qualityScore ?? 0) * 10}%` }} />
                                  </div>
                                  <span className="text-xs font-bold font-mono text-foreground">{ai.opponent?.qualityScore ?? "—"}/10</span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border font-mono font-bold">⏱ {ai.opponent?.timeComplexity ?? "—"}</span>
                                <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border font-mono font-bold">💾 {ai.opponent?.spaceComplexity ?? "—"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{ai.opponent?.verdict}</p>
                              {ai.opponent && ai.opponent.strengths.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-emerald-400 mb-1.5">Strengths</p>
                                  {ai.opponent.strengths.map((s, j) => (
                                    <p key={j} className="text-xs text-muted-foreground flex gap-1.5 mb-1">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />{s}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Comparison strip */}
                          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
                            <TrendingUp className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{ai.comparison}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContainer>
              );
            })}
          </div>
        </div>

        {/* ── ACTIONS ─────────────────────────────────────────────────────────── */}
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

        {roomCode && <p className="text-center text-xs text-muted-foreground/40 font-mono">Room {roomCode}</p>}
      </main>

      {/* ── CHATBOT ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "440px" }}>
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-bold">AI Coach</p>
                <p className="text-[10px] text-muted-foreground">Ask about your battle</p>
              </div>
              {!aiLoading && <div className="ml-auto flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] text-emerald-500">Ready</span></div>}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user" ? "bg-blue-500/15 border border-blue-500/20" : "bg-violet-500/15 border border-violet-500/20")}>
                    {msg.role === "user" ? <User className="h-3 w-3 text-blue-400" /> : <Bot className="h-3 w-3 text-violet-400" />}
                  </div>
                  <div className={cn("max-w-[200px] px-3 py-2 rounded-xl text-xs leading-relaxed",
                    msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm")}>
                    {msg.content || <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="px-3 py-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask about your code…" disabled={aiLoading}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500/50 placeholder:text-muted-foreground/50 transition-colors disabled:opacity-50" />
                <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading || aiLoading}
                  className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              {aiLoading && <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Waiting for AI analysis…</p>}
            </div>
          </div>
        )}

        <button onClick={() => setChatOpen(p => !p)}
          className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200",
            chatOpen ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-card border border-border hover:border-violet-500/40 text-muted-foreground hover:text-violet-400")}>
          {chatOpen ? <XCircle className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

