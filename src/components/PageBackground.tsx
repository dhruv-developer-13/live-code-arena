import { cn } from "@/lib/utils";

type GlowTone = "emerald" | "amber" | "rose" | "none";
type GlowSize = "hero" | "compact";

type PageBackgroundProps = {
  className?: string;
  gridOpacityClass?: string;
  glowTone?: GlowTone;
  glowSize?: GlowSize;
};

const GLOW_CLASS_MAP: Record<GlowSize, Record<Exclude<GlowTone, "none">, string>> = {
  hero: {
    emerald: "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]",
    amber: "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]",
    rose: "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(239,68,68,0.08),transparent)]",
  },
  compact: {
    emerald: "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.07),transparent)]",
    amber: "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(245,158,11,0.07),transparent)]",
    rose: "bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(239,68,68,0.07),transparent)]",
  },
};

export function PageBackground({
  className,
  gridOpacityClass = "opacity-40",
  glowTone = "emerald",
  glowSize = "hero",
}: PageBackgroundProps) {
  const glowClass = glowTone === "none" ? "" : GLOW_CLASS_MAP[glowSize][glowTone];

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px]",
          gridOpacityClass
        )}
      />
      {glowTone !== "none" && <div className={cn("absolute inset-0", glowClass)} />}
    </div>
  );
}
