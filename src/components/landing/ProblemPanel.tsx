import { memo } from "react";

const PROBLEMS = [
  { label: "Easy", color: "text-emerald-400", active: false, done: true },
  { label: "Medium", color: "text-amber-400", active: true, done: false },
  { label: "Hard", color: "text-rose-400", active: false, done: false },
];

function getActiveUnderlineColor(label: string) {
  if (label === "Easy") return "bg-emerald-500";
  if (label === "Medium") return "bg-amber-500";
  return "bg-rose-500";
}

function ProblemPanelComponent() {
  return (
    <div className="col-span-3 flex flex-col bg-background">
      {/* Difficulty tabs */}
      <div className="flex border-b border-border">
        {PROBLEMS.map((p) => (
          <div
            key={p.label}
            className={`flex-1 py-2 text-center font-semibold relative cursor-default ${p.active ? "text-foreground" : "text-muted-foreground"}`}
          >
            <span className={p.color}>{p.label}</span>
            {p.done && <span className="ml-1 text-emerald-400">✓</span>}
            {p.active && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${getActiveUnderlineColor(p.label)}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Problem content */}
      <div className="p-3 space-y-2.5 overflow-hidden select-none">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-foreground leading-tight">Longest Substring Without Repeating</p>
          <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[9px]">
            200pts
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Given a string <span className="font-mono text-muted-foreground">s</span>, find the length of the longest substring
          without repeating characters.
        </p>

        {/* Example */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-2 py-1 bg-card/60 border-b border-border">
            <span className="text-muted-foreground font-bold">Example 1</span>
          </div>
          <div className="p-2 font-mono space-y-1">
            <div>
              <span className="text-muted-foreground">Input: </span>
              <span className="text-muted-foreground">s = "abcabcbb"</span>
            </div>
            <div>
              <span className="text-muted-foreground">Output: </span>
              <span className="text-muted-foreground">3</span>
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <p className="font-bold text-muted-foreground mb-1">Constraints</p>
          <div className="rounded-lg bg-card/40 border border-border p-2 space-y-0.5">
            <p className="font-mono text-muted-foreground">
              <span className="text-muted-foreground mr-1">•</span>0 &lt;= s.length &lt;= 5×10⁴
            </p>
            <p className="font-mono text-muted-foreground">
              <span className="text-muted-foreground mr-1">•</span>s consists of ASCII chars
            </p>
          </div>
        </div>

        <p className="text-muted-foreground italic border-t border-border/60 pt-2">
          💡 Call <span className="font-mono not-italic text-muted-foreground">solution()</span> to execute
        </p>
      </div>
    </div>
  );
}

export const ProblemPanel = memo(ProblemPanelComponent);
