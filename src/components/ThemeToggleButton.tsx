import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/useTheme";

type ThemeToggleButtonProps = {
  className?: string;
  ariaLabel?: string;
};

export function ThemeToggleButton({
  className,
  ariaLabel = "Toggle theme",
}: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={ariaLabel}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
