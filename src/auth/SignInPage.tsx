import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { Swords, Eye, EyeOff, ArrowRight, Github } from "lucide-react";

export default function SignIn() {
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") navigate("/");
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_github" | "oauth_google") => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {/* Grid bg */}
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
        {/* Logo */}
        <Link
          to="/"
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

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 mb-7">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up
            </Link>
          </p>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => handleOAuth("oauth_github")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
            <button
              onClick={() => handleOAuth("oauth_google")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-400">Password</label>
                <a href="#" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
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
              disabled={loading || !isLoaded}
              className="group w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign in <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          By continuing you agree to our{" "}
          <a href="#" className="hover:text-zinc-500 transition-colors">Terms</a> &{" "}
          <a href="#" className="hover:text-zinc-500 transition-colors">Privacy</a>
        </p>
      </motion.div>
    </div>
  );
}