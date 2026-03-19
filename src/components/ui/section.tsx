import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  /** Add background color */
  background?: "none" | "card-subtle" | "card"
  /** Add top/bottom border */
  divided?: boolean
  /** Custom container width */
  container?: "full" | "default" | "narrow"
}

export function Section({
  children,
  background = "none",
  divided = false,
  container = "default",
  className,
  ...props
}: SectionProps) {
  const bgClasses = {
    none: "",
    "card-subtle": "bg-card/20",
    card: "bg-card",
  }

  const containerClasses = {
    full: "w-full",
    default: "max-w-7xl mx-auto",
    narrow: "max-w-5xl mx-auto",
  }

  return (
    <section
      className={cn(
        "relative z-10 py-24 px-6 md:px-12",
        bgClasses[background],
        divided && "border-y border-border/40",
        className
      )}
      {...props}
    >
      <div className={cn("space-y-16", containerClasses[container])}>
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  label?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center space-y-4">
      {label && (
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
          {label}
        </p>
      )}
      {typeof title === "string" ? (
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </h2>
      ) : (
        title
      )}
      {subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
