import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3 px-2 py-0.5",
  {
    variants: {
      variant: {
        solid: "",
        outline: "border",
        subtle: "border",
        ghost: "border-transparent",
        link: "border-transparent underline-offset-4 hover:underline",
      },

      accent: {
        default: "",
        emerald: "",
        blue: "",
        rose: "",
        amber: "",
        violet: "",
        orange: "",
      },
    },

    /**
     * Default
     */
    defaultVariants: {
      variant: "solid",
      accent: "default",
    },

    /**
     * Combination styles
     */
    compoundVariants: [
      // ===== DEFAULT (Design System) =====
      {
        variant: "solid",
        accent: "default",
        class: "bg-primary text-primary-foreground",
      },
      {
        variant: "outline",
        accent: "default",
        class: "border-border text-foreground",
      },
      {
        variant: "subtle",
        accent: "default",
        class: "bg-muted text-muted-foreground",
      },

      // ===== EMERALD =====
      {
        variant: "solid",
        accent: "emerald",
        class: "bg-emerald-500 text-white",
      },
      {
        variant: "outline",
        accent: "emerald",
        class: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      },
      {
        variant: "subtle",
        accent: "emerald",
        class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      },

      // ===== BLUE =====
      {
        variant: "solid",
        accent: "blue",
        class: "bg-blue-500 text-white",
      },
      {
        variant: "outline",
        accent: "blue",
        class: "border-blue-500/30 bg-blue-500/10 text-blue-400",
      },
      {
        variant: "subtle",
        accent: "blue",
        class: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      },

      // ===== ROSE =====
      {
        variant: "solid",
        accent: "rose",
        class: "bg-rose-500 text-white",
      },
      {
        variant: "outline",
        accent: "rose",
        class: "border-rose-500/30 bg-rose-500/10 text-rose-400",
      },
      {
        variant: "subtle",
        accent: "rose",
        class: "bg-rose-500/15 text-rose-400 border-rose-500/20",
      },

      // ===== AMBER =====
      {
        variant: "solid",
        accent: "amber",
        class: "bg-amber-500 text-white",
      },
      {
        variant: "outline",
        accent: "amber",
        class: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      },
      {
        variant: "subtle",
        accent: "amber",
        class: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      },

      // ===== VIOLET =====
      {
        variant: "solid",
        accent: "violet",
        class: "bg-violet-500 text-white",
      },
      {
        variant: "outline",
        accent: "violet",
        class: "border-violet-500/30 bg-violet-500/10 text-violet-400",
      },
      {
        variant: "subtle",
        accent: "violet",
        class: "bg-violet-500/15 text-violet-400 border-violet-500/20",
      },

      // ===== ORANGE =====
      {
        variant: "solid",
        accent: "orange",
        class: "bg-orange-500 text-white",
      },
      {
        variant: "outline",
        accent: "orange",
        class: "border-orange-500/30 bg-orange-500/10 text-orange-400",
      },
      {
        variant: "subtle",
        accent: "orange",
        class: "bg-orange-500/15 text-orange-400 border-orange-500/20",
      },
    ],
  }
)


export type BadgeVariantProps = VariantProps<typeof badgeVariants>