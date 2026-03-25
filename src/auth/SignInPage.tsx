import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Swords, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex items-center justify-center px-4"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.07),transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <Link
          to="/landing"
          className="flex items-center justify-center gap-2 mb-8"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">
            code<span className="text-emerald-400">arena</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="your_handle or you@example.com"
                disabled={loading}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              {loading
                ? <><Spinner className="size-4" />Signing in...</>
                : <>Sign in <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our{" "}
          <a href="#" className="hover:text-foreground transition-colors">Terms</a> &{" "}
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        </p>
      </motion.div>
    </div>
  );
}
