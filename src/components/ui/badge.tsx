import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { badgeVariants, type BadgeVariantProps } from "./badgeVariants"

/**
 * Badge Props
 */
export interface BadgeProps
  extends React.ComponentProps<"span">,
    BadgeVariantProps {
  asChild?: boolean
  pulse?: boolean
  icon?: React.ReactNode
}

/**
 * Badge Component
 */
function Badge({
  className,
  variant,
  accent,
  asChild = false,
  pulse = false,
  icon,
  children,
  ...props
}: Readonly<BadgeProps>) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, accent }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {icon && <span className={pulse ? "animate-pulse" : ""}>{icon}</span>}
      {children}
    </Comp>
  )
}

export { Badge }