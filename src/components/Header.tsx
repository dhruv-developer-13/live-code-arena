import { useMemo, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Show, UserButton } from "@clerk/react";


export function Header() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((p) => !p);
  };
  
  const roomCode = useMemo(() => {
    const waitingMatch = matchPath("/waiting/:roomCode", location.pathname);
    const battleMatch = matchPath("/battle/:roomCode", location.pathname);
    return waitingMatch?.params.roomCode ?? battleMatch?.params.roomCode ?? "";
  }, [location.pathname]);

  const generatedCode = useMemo(
    () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    []
  );

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Battle Room",
    href: `/waiting/${roomCode || generatedCode}`,
  },
  { label: "Leaderboard", href: "/leaderboard" },
];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6 relative">

        {/* Logo */}
        <Link to="/" className="font-black text-lg tracking-tight shrink-0">
          code<span className="text-emerald-500">arena</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Profile button */}
          <Show when="signed-in" fallback={<a href="/sign-in">Sign In</a>}>
            <UserButton />
          </Show>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 px-6 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}