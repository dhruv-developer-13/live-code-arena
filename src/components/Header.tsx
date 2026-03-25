import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { LogOut } from "lucide-react";


export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Battle Room",href: "/battle-room"},
  { label: "Battle History", href: "/history" },
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
        <div className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 rounded-xl border border-border/60 bg-muted/30 p-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              aria-current={location.pathname === link.href ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === link.href
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <ThemeToggleButton />

          {/* Profile button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{user.username}</span>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
