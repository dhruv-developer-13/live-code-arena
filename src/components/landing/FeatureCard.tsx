import type { AccentColor } from "@/data/features";
import { accentMap } from "@/lib/accentMap";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: AccentColor;
  isHovered?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
  isHovered = false,
  onHoverStart,
  onHoverEnd,
}: FeatureCardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative p-6 rounded-2xl border border-border bg-card/50 cursor-default overflow-hidden group transition-colors duration-300 hover:border-primary"
    >
      {/* Hover glow */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${colors.light} pointer-events-none`}
          />
        )}
      </AnimatePresence>

      <div className={`inline-flex p-2.5 rounded-xl ${colors.bg} border ${colors.border} mb-4`}>
        <Icon className={`h-5 w-5 ${colors.text}`} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}
