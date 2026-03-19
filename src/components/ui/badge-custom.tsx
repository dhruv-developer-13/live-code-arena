import { cn } from "@/lib/utils"

type BadgeAccent = "emerald" | "blue" | "rose" | "amber" | "violet" | "orange"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent color */
  accent?: BadgeAccent
  /** Badge style */
  variant?: "solid" | "outline" | "subtle"
  /** Show pulse animation */
  pulse?: boolean
  /** Left icon element */
  icon?: React.ReactNode
  children: React.ReactNode
}

const accentStyles: Record<BadgeAccent, Record<string, string>> = {
  emerald: {
    solid: "bg-emerald-500 text-white",
    outline: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    subtle: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  },
  blue: {
    solid: "bg-blue-500 text-white",
    outline: "border border-blue-500/30 bg-blue-500/10 text-blue-400",
    subtle: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  },
  rose: {
    solid: "bg-rose-500 text-white",
    outline: "border border-rose-500/30 bg-rose-500/10 text-rose-400",
    subtle: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
  },
  amber: {
    solid: "bg-amber-500 text-white",
    outline: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
    subtle: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  },
  violet: {
    solid: "bg-violet-500 text-white",
    outline: "border border-violet-500/30 bg-violet-500/10 text-violet-400",
    subtle: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  },
  orange: {
    solid: "bg-orange-500 text-white",
    outline: "border border-orange-500/30 bg-orange-500/10 text-orange-400",
    subtle: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  },
}

export function Badge({
  accent = "emerald",
  variant = "outline",
  pulse = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
        accentStyles[accent][variant],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {icon && (
        <span className={pulse ? "animate-pulse" : ""}>
          {icon}
        </span>
      )}
      {children}
    </div>
  )
}
