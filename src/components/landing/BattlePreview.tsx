import { useEffect, useState, useMemo, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { ProblemPanel } from "./ProblemPanel";
import { CodeEditor } from "./CodeEditor";
import { CompetitionPanel } from "./CompetitionPanel";

interface CodeLine {
  indent: number;
  content: ReactNode;
}

interface ScoreState {
  myScore: number;
  oppScore: number;
  myPulse: boolean;
  oppPulse: boolean;
}

type Submission = { problem: string; status: "AC" | "WA"; time: string };

export function BattlePreview() {
  const [timeLeft, setTimeLeft] = useState(2441);
  const [scores, setScores] = useState<ScoreState>({
    myScore: 100,
    oppScore: 0,
    myPulse: false,
    oppPulse: false,
  });
  const [codeLines, setCodeLines] = useState(4);
  const [submissions, setSubmissions] = useState<Submission[]>([
    { problem: "Two Sum", status: "AC", time: "04:21" },
  ]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Score simulation effect with proper pulse cleanup
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const setPulse = (player: "my" | "opp") => {
      setScores((prev) => ({
        ...prev,
        ...(player === "my" ? { myPulse: true } : { oppPulse: true }),
      }));

      const resetId = setTimeout(() => {
        setScores((prev) => ({
          ...prev,
          ...(player === "my" ? { myPulse: false } : { oppPulse: false }),
        }));
      }, 600);
      timers.push(resetId);
    };

    const oppFirst = setTimeout(() => {
      setScores((prev) => ({ ...prev, oppScore: 85 }));
      setPulse("opp");
    }, 3500);

    const myUpdate = setTimeout(() => {
      setScores((prev) => ({ ...prev, myScore: 300 }));
      setPulse("my");
      setSubmissions((prev) => [
        ...prev,
        { problem: "Longest Substring", status: "AC", time: "18:44" },
      ]);
    }, 7000);

    const oppSecond = setTimeout(() => {
      setScores((prev) => ({ ...prev, oppScore: 230 }));
      setPulse("opp");
    }, 9500);

    timers.push(oppFirst, myUpdate, oppSecond);

    return () => timers.forEach(clearTimeout);
  }, []);

  // Code typing simulation
  useEffect(() => {
    const interval = setInterval(() => setCodeLines((p) => (p < 10 ? p + 1 : p)), 1800);
    return () => clearInterval(interval);
  }, []);

  const CODE = useMemo<readonly CodeLine[]>(() => [
    {
      indent: 0,
      content: (
        <>
          <span className="text-blue-400">def </span>
          <span className="text-emerald-400">solution</span>
          <span className="text-foreground">(nums, target):</span>
        </>
      ),
    },
    { indent: 1, content: <><span className="text-foreground">seen = {"{}"}</span></> },
    {
      indent: 1,
      content: (
        <>
          <span className="text-blue-400">for </span>
          <span className="text-foreground">i, n </span>
          <span className="text-blue-400">in </span>
          <span className="text-foreground">enumerate(nums):</span>
        </>
      ),
    },
    { indent: 2, content: <><span className="text-foreground">diff = target - n</span></> },
    {
      indent: 2,
      content: (
        <>
          <span className="text-blue-400">if </span>
          <span className="text-foreground">diff </span>
          <span className="text-blue-400">in </span>
          <span className="text-foreground">seen:</span>
        </>
      ),
    },
    {
      indent: 3,
      content: (
        <>
          <span className="text-rose-400">return </span>
          <span className="text-foreground">[seen[diff], i]</span>
        </>
      ),
    },
    { indent: 2, content: <><span className="text-foreground">seen[n] = i</span></> },
    { indent: 0, content: <></> },
    { indent: 0, content: <><span className="text-foreground">solution()</span></> },
  ], []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-background shadow-2xl shadow-black/60 text-[11px]">
      <div className="grid grid-cols-12" style={{ minHeight: 300 }}>
        <div className="col-span-12">
          <TopBar
            timeLeft={timeLeft}
            myScore={scores.myScore}
            oppScore={scores.oppScore}
            myPulse={scores.myPulse}
            oppPulse={scores.oppPulse}
          />
        </div>

        <div className="col-span-12 grid grid-cols-12 divide-x divide-border/70 min-h-[260px]">
          <ProblemPanel />
          <CodeEditor codeLines={codeLines} code={CODE} />
          <CompetitionPanel
            myScore={scores.myScore}
            oppScore={scores.oppScore}
            myPulse={scores.myPulse}
            oppPulse={scores.oppPulse}
            submissions={submissions}
          />
        </div>
      </div>
    </div>
  );
}
