import { memo } from "react";
import { Trophy, CheckCircle2, Circle } from "lucide-react";

interface CompetitionPanelProps {
  myScore: number;
  oppScore: number;
  myPulse: boolean;
  oppPulse: boolean;
  submissions: Array<{ problem: string; status: "AC" | "WA"; time: string }>;
}

const PROGRESS = [
  { diff: "Easy", earned: 100, max: 100, done: true },
  { diff: "Medium", earned: 0, max: 200, done: false },
  { diff: "Hard", earned: 0, max: 300, done: false },
];

function CompetitionPanelComponent({
  myScore,
  oppScore,
  myPulse,
  oppPulse,
  submissions,
}: CompetitionPanelProps) {
  const iLeading = myScore >= oppScore;
  const total = myScore + oppScore;

  return (
    <div className="col-span-3 flex flex-col bg-background">
      {/* Live Score */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <span>⚡</span>
          <span className="font-bold text-foreground">Live Score</span>
        </div>

        {/* You */}
        <div
          className={`relative overflow-hidden flex items-center justify-between p-2.5 rounded-lg border transition-all duration-500 ${
            iLeading
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-card border-border"
          }`}
        >
          {iLeading && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          )}
          <div className="flex items-center gap-1.5">
            {iLeading && <Trophy className="h-2.5 w-2.5 text-emerald-400" />}
            <span className="font-semibold text-foreground">You</span>
          </div>
          <span
            className={`font-black font-mono text-base tabular-nums transition-all duration-300 ${
              iLeading ? "text-emerald-400" : "text-foreground"
            } ${myPulse ? "scale-125" : ""}`}
          >
            {myScore}
          </span>
        </div>

        {/* Opponent */}
        <div
          className={`relative overflow-hidden flex items-center justify-between p-2.5 rounded-lg border transition-all duration-500 ${
            !iLeading
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-card border-border"
          }`}
        >
          {!iLeading && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
          )}
          <div className="flex items-center gap-1.5">
            {!iLeading && <Trophy className="h-2.5 w-2.5 text-rose-400" />}
            <span className="font-semibold text-foreground">Opp</span>
          </div>
          <span
            className={`font-black font-mono text-base tabular-nums transition-all duration-300 ${
              !iLeading ? "text-rose-400" : "text-foreground"
            } ${oppPulse ? "scale-125" : ""}`}
          >
            {oppScore}
          </span>
        </div>

        {/* Score bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          {total > 0 && (
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${(myScore / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="p-3 border-b border-border space-y-2\">
        <span className="font-bold text-foreground block mb-2">Your Progress</span>
        {PROGRESS.map(({ diff, earned, max, done }) => (
          <div key={diff} className="flex items-center justify-between">
            <span
              className={`font-semibold ${
                diff === "Easy"
                  ? "text-emerald-400"
                  : diff === "Medium"
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {diff}
            </span>
            {done ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                <CheckCircle2 className="h-3 w-3" />
                {earned}/{max}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground font-mono">
                <Circle className="h-3 w-3" />
                0/{max}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Submissions */}
      <div className="p-3 flex-1 overflow-hidden">
        <span className="font-bold text-foreground block mb-2">Submissions</span>
        <div className="space-y-1.5">
          {submissions.map((sub, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-card border border-border">
              <p className="text-muted-foreground truncate font-medium">{sub.problem}</p>
              <span
                className={`font-black font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  sub.status === "AC"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const CompetitionPanel = memo(CompetitionPanelComponent);
