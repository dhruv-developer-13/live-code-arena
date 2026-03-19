import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  handle: string;
  text: string;
  rating: number;
}

export function TestimonialCard({ name, handle, text, rating }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-6 rounded-2xl border border-border bg-card/50"
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, j) => (
          <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-foreground leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{handle}</p>
        </div>
      </div>
    </motion.div>
  );
}
