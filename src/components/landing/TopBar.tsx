import { memo } from "react";
import { Clock, Shield } from "lucide-react";
import { formatTime } from "@/lib/accentMap";

interface TopBarProps {
  timeLeft: number;
  myScore: number;
  oppScore: number;
  myPulse: boolean;
  oppPulse: boolean;
}

function TopBarComponent({ timeLeft, myScore, oppScore, myPulse, oppPulse }: TopBarProps) {
  const iLeading = myScore >= oppScore;

  return (
    <div className="relative flex items-center h-10 px-4 border-b border-border bg-card/90">
      {/* Left: timer */}
      <div className="flex items-center gap-1.5 bg-muted/80 px-2.5 py-1 rounded-md font-mono font-bold text-foreground">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-emerald-400">{formatTime(timeLeft)}</span>
      </div>

      {/* Center: scores */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className={`flex flex-col items-center px-3 py-0.5 rounded-lg transition-all duration-300 ${iLeading ? "bg-emerald-500/15 ring-1 ring-emerald-500/40" : "bg-muted/60"}`}>
          <span className="text-[9px] text-muted-foreground leading-none mb-0.5">You</span>
          <span className={`font-black font-mono tabular-nums text-sm transition-all duration-300 ${iLeading ? "text-emerald-400" : "text-foreground"} ${myPulse ? "scale-125" : ""}`}>
            {myScore}
          </span>
        </div>
        <span className="text-muted-foreground font-bold text-xs">vs</span>
        <div className={`flex flex-col items-center px-3 py-0.5 rounded-lg transition-all duration-300 ${!iLeading ? "bg-rose-500/15 ring-1 ring-rose-500/40" : "bg-muted/60"}`}>
          <span className="text-[9px] text-muted-foreground leading-none mb-0.5">Opp</span>
          <span className={`font-black font-mono tabular-nums text-sm transition-all duration-300 ${!iLeading ? "text-rose-400" : "text-foreground"} ${oppPulse ? "scale-125" : ""}`}>
            {oppScore}
          </span>
        </div>
      </div>

      {/* Right: shield + leave */}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono">
          <Shield className="h-2.5 w-2.5" />
          <span>0/3</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
          <span>Leave</span>
        </div>
      </div>
    </div>
  );
}

export const TopBar = memo(TopBarComponent);
