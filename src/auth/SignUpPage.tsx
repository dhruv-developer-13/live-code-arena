import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp, useSignIn } from "@clerk/react";
import { Swords, Eye, EyeOff, ArrowRight, Github } from "lucide-react";

export default function SignUp() {

  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!signUp) return;

  setLoading(true);
  setError("");

  try {
    await signUp.create({
      emailAddress: email,
      password,
    });

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    setStep("verify");

  } catch (err: any) {
    setError(err.errors?.[0]?.message ?? "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await signUp.setActive({ session: result.createdSessionId });
        navigate("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_github" | "oauth_google") => {
    if (!signIn) return;

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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.07),transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >

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

        {step === "form" ? (

          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">

              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                Create account
              </h1>

              <p className="text-sm text-zinc-500 mb-7">
                Already have one?{" "}
                <Link to="/sign-in" className="text-emerald-400 hover:text-emerald-300">
                  Sign in
                </Link>
              </p>

              <div className="grid grid-cols-2 gap-2 mb-5">

                <button
                  onClick={() => handleOAuth("oauth_github")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </button>

                <button
                  onClick={() => handleOAuth("oauth_google")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm"
                >
                  Google
                </button>

              </div>

              <form onSubmit={handleSignUp} className="space-y-4">

                <input
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  placeholder="username"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950"
                />

                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2"
                >
                  {loading ? "Loading..." : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </motion.div>

        ) : (

          <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">

              <h1 className="text-2xl font-bold mb-4">
                Verify email
              </h1>

              <form onSubmit={handleVerify} className="space-y-4">

                <input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-center"
                />

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white"
                >
                  Verify & Continue
                </button>

              </form>

            </div>
          </motion.div>

        )}

      </motion.div>
    </div>
  );
}