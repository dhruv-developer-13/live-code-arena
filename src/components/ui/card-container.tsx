import { cn } from "@/lib/utils"

type CardVariant = "default" | "interactive" | "muted"

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card style variant */
  variant?: CardVariant
  /** Show hover lift effect */
  interactive?: boolean
  /** Custom padding */
  padded?: "none" | "sm" | "md" | "lg"
  children: React.ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: "border-border bg-card/50",
  interactive: "border-border bg-card/50 hover:border-primary transition-colors duration-300",
  muted: "border-border/60 bg-muted/30",
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export function CardContainer({
  variant = "default",
  interactive = false,
  padded = "md",
  className,
  children,
  ...props
}: CardContainerProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border overflow-hidden",
        variantStyles[interactive ? "interactive" : variant],
        paddingStyles[padded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({
  icon,
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)} {...props}>
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="p-2 rounded-lg bg-muted">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardBody({
  className,
  children,
  ...props
}: CardBodyProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-between pt-4 border-t border-border", className)}
      {...props}
    >
      {children}
    </div>
  )
}
