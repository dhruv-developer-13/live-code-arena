import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card Variants
 */
const cardVariants = cva(
  "flex flex-col rounded-xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card shadow-sm",
        muted: "border-border/60 bg-muted/30",
        interactive: "border-border bg-card shadow-sm hover:border-primary",
      },

      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },

    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

/**
 * Card Root
 */
interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

function Card({
  className,
  variant,
  padding,
  interactive,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants({
          variant: interactive ? "interactive" : variant,
          padding,
        }),
        className
      )}
      {...props}
    />
  )
}

/**
 * Header
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-start justify-between gap-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * Title
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Description
 */
function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Action (top-right)
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

/**
 * Content
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("space-y-3", className)}
      {...props}
    />
  )
}

/**
 * Footer
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between border-t border-border pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}