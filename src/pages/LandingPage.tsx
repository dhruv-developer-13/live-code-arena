import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  Swords, Zap, Shield, Trophy, Clock, Code2, ChevronRight,
  Github, Twitter, Star, ArrowRight, Play, Check, Users,
  Target, TrendingUp, Lock, Globe, Terminal, Cpu
} from "lucide-react";
import { PageBackground } from "@/components/PageBackground";

//  ANIMATED BATTLE PREVIEW 

const LINES_A = [
  { text: "def two_sum(nums, target):", delay: 0 },
  { text: "    seen = {}", delay: 0.3 },
  { text: "    for i, n in enumerate(nums):", delay: 0.6 },
  { text: "        diff = target - n", delay: 0.9 },
  { text: "        if diff in seen:", delay: 1.2 },
  { text: "            return [seen[diff], i]", delay: 1.5 },
  { text: "        seen[n] = i", delay: 1.8 },
];
const LINES_B = [
  { text: "def two_sum(nums, target):", delay: 0.2 },
  { text: "    lookup = {}", delay: 0.5 },
  { text: "    for idx, val in enumerate(nums):", delay: 0.9 },
  { text: "        comp = target - val", delay: 1.3 },
  { text: "        if comp in lookup:", delay: 1.7 },
  { text: "            return [lookup[comp], idx]", delay: 2.1 },
  { text: "        lookup[val] = idx", delay: 2.5 },
];

function CodeLine({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000 + 800);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.2 }}
      className="font-mono text-xs leading-6 whitespace-pre"
    >
      <span className="text-emerald-400/30 mr-3 select-none">
        {String(LINES_A.findIndex(l => l.text === text) + 1 || LINES_B.findIndex(l => l.text === text) + 1).padStart(2, "0")}
      </span>
      {text.startsWith("def ") ? (
        <>
          <span className="text-blue-400">def </span>
          <span className="text-emerald-400">{text.slice(4, text.indexOf("("))}</span>
          <span className="text-zinc-300">{text.slice(text.indexOf("("))}</span>
        </>
      ) : text.includes("return") ? (
        <>
          <span className="text-zinc-600">{text.match(/^\s+/)?.[0]}</span>
          <span className="text-rose-400">return </span>
          <span className="text-zinc-300">{text.trimStart().slice(7)}</span>
        </>
      ) : text.includes("for ") ? (
        <>
          <span className="text-zinc-600">{text.match(/^\s+/)?.[0]}</span>
          <span className="text-blue-400">for </span>
          <span className="text-zinc-300">{text.trimStart().slice(4)}</span>
        </>
      ) : text.includes("if ") ? (
        <>
          <span className="text-zinc-600">{text.match(/^\s+/)?.[0]}</span>
          <span className="text-blue-400">if </span>
          <span className="text-zinc-300">{text.trimStart().slice(3)}</span>
        </>
      ) : (
        <span className="text-zinc-300">{text}</span>
      )}
    </motion.div>
  );
}

function BattlePreview() {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2700);

  useEffect(() => {
    const t = setTimeout(() => setScoreA(100), 3200);
    const t2 = setTimeout(() => setScoreB(85), 4500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <Clock className="h-3 w-3" />
          <span className="text-emerald-400">{fmt(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.span
            key={scoreA}
            initial={{ scale: 1.4, color: "#10b981" }}
            animate={{ scale: 1, color: "#d4d4d8" }}
            className="font-mono text-xs font-bold text-zinc-300"
          >{scoreA}</motion.span>
          <span className="text-zinc-600 text-xs">vs</span>
          <span className="font-mono text-xs font-bold text-zinc-300">{scoreB}</span>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-2 divide-x divide-zinc-800">
        {[
          { lines: LINES_A, label: "aryan_dev", accent: "emerald" },
          { lines: LINES_B, label: "CodeMaster99", accent: "rose" },
        ].map(({ lines, label, accent }) => (
          <div key={label} className="p-4 min-h-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full bg-${accent}-500`} />
              <span className="text-xs font-mono text-zinc-500">{label}</span>
            </div>
            {lines.map((l, i) => (
              <CodeLine key={i} text={l.text} delay={l.delay} />
            ))}
          </div>
        ))}
      </div>

      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
    </div>
  );
}

//  SCROLL REVEAL 

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

//  DATA 

const FEATURES = [
  { icon: Swords,   title: "1v1 Live Battles",       desc: "Real-time competitive coding against opponents of your skill level. Watch each other's scores update live.",             accent: "emerald" },
  { icon: Shield,   title: "Anti-Cheat Engine",       desc: "Fullscreen enforcement, tab-switch detection, clipboard blocking. Every battle is fair and monitored.",               accent: "rose"    },
  { icon: Clock,    title: "45-Minute Format",         desc: "Three problems — Easy, Medium, Hard. Time pressure separates fast thinkers from the rest.",                          accent: "amber"   },
  { icon: Trophy,   title: "Ranked Leaderboard",      desc: "Global rankings updated after every match. Climb from Bronze to Grandmaster with a transparent ELO system.",         accent: "blue"    },
  { icon: Code2,    title: "Python 3 Native",          desc: "Write clean Python directly in the browser with syntax highlighting, tab indentation, and instant feedback.",        accent: "violet"  },
  { icon: Zap,      title: "Live Score Feed",          desc: "See your opponent's score update in real-time via WebSocket. Know exactly where you stand at all times.",           accent: "orange"  },
];

const STEPS = [
  { n: "01", title: "Create or Join a Room",   desc: "Generate a unique room code and share it with your opponent, or paste one you received.",     icon: Terminal },
  { n: "02", title: "Both Players Ready Up",   desc: "Once both players hit Ready in the Waiting Room, the arena launches simultaneously for both.", icon: Users    },
  { n: "03", title: "Code Under Pressure",     desc: "45 minutes. 3 problems. Full-screen locked. No copy-paste. Pure skill.",                       icon: Cpu      },
  { n: "04", title: "Results & Rankings",      desc: "Detailed breakdown per problem, score comparison, and immediate leaderboard update.",           icon: TrendingUp },
];

const TESTIMONIALS = [
  { name: "Priya K.",    handle: "@priyasolves",   text: "The anti-cheat system is legitimately impressive. No more worrying about opponents googling answers. This is actual skill testing.",   rating: 5 },
  { name: "Marcus T.",   handle: "@mtcode",        text: "I've used Codeforces, LeetCode, HackerRank. Nothing hits the same adrenaline as a live 1v1 with a 45-minute clock.",                  rating: 5 },
  { name: "Ananya R.",   handle: "@ananya_dev",    text: "Got a FAANG offer last month. CodeArena was my secret weapon — nothing else trains you to code fast under real pressure.",             rating: 5 },
  { name: "Jake L.",     handle: "@jakeleetcode",  text: "The leaderboard is addictive. Went from Bronze to Gold in two weeks just by grinding ranked battles every evening.",                    rating: 5 },
];

const STATS = [
  { value: "12K+",  label: "Battles Fought" },
  { value: "4.8K",  label: "Active Players" },
  { value: "98%",   label: "Uptime SLA"     },
  { value: "< 80ms", label: "WS Latency"   },
];

//  LANDING PAGE 

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {/*  Grid noise background  */}
      <PageBackground />

      {/*  NAV  */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            code<span className="text-emerald-400">arena</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          {["Features", "How it Works", "Interface", "Why CodeArena"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-zinc-100 transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/sign-in" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5">Sign in</a>
          <a
            href="/sign-up"
            className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Get started
          </a>
        </div>
      </motion.nav>

      {/*  HERO  */}
      <section className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div style={{ y: heroY }} className="text-center max-w-4xl mx-auto mb-14">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live battles happening now
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Code faster than
            <br />
            <span className="text-emerald-400">your opponent.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Real-time 1v1 coding battles with anti-cheat enforcement. Sharpen your skills
            under pressure, climb the leaderboard, and prove your edge.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <a
              href="/sign-up"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:-translate-y-0.5"
            >
              Start battling free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              <Play className="h-3.5 w-3.5" />
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Battle preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <BattlePreview />
          {/* Glow under preview */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/*  STATS  */}
      <section className="relative z-10 border-y border-zinc-800/60 bg-zinc-900/30 py-10 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.08} className="text-center">
              <p className="text-3xl font-bold text-zinc-100 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
              <p className="text-sm text-zinc-500">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/*  FEATURES  */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Platform Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built for serious
            <br />
            <span className="text-zinc-400">competitive coders</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <motion.div
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 cursor-default overflow-hidden group transition-colors duration-300 hover:border-zinc-700"
              >
                {/* Hover glow */}
                <AnimatePresence>
                  {hoveredFeature === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-${accent}-500/5 pointer-events-none`}
                    />
                  )}
                </AnimatePresence>

                <div className={`inline-flex p-2.5 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 mb-4`}>
                  <Icon className={`h-5 w-5 text-${accent}-400`} />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-12 bg-zinc-900/20 border-y border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Process</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              From zero to battle
              <br />
              <span className="text-zinc-400">in 60 seconds</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc, icon: Icon }, i) => (
              <Reveal key={n} delay={i * 0.1}>
                <div className="relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-6 h-px bg-zinc-700 z-10" />
                  )}
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs font-bold text-emerald-400">{n}</span>
                      <div className="p-2 rounded-lg bg-zinc-800">
                        <Icon className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 mb-2">{title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*  PRODUCT SHOWCASE  */}
      <section id="interface" className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Interface</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Every pixel
            <br />
            <span className="text-zinc-400">built for focus</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Live Score Tracker",  desc: "Real-time opponent score with WebSocket sync",   color: "from-emerald-500/20 to-transparent", accent: "emerald" },
            { label: "Resizable Editor",    desc: "Drag to resize panels, expandable test results", color: "from-blue-500/20 to-transparent",    accent: "blue"    },
            { label: "Anti-Cheat HUD",      desc: "Violation counter, fullscreen lock, tab monitor",color: "from-rose-500/20 to-transparent",    accent: "rose"    },
          ].map(({ label, desc, color, accent }, i) => (
            <Reveal key={label} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                {/* Mock UI element */}
                <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs">
                  {accent === "emerald" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">You</span>
                        <span className="text-emerald-400 font-bold">350</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800">
                        <div className="h-full w-[70%] rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Opponent</span>
                        <span className="text-rose-400 font-bold">280</span>
                      </div>
                    </div>
                  )}
                  {accent === "blue" && (
                    <div className="space-y-1">
                      <div className="text-zinc-500">def <span className="text-emerald-400">solution</span>():</div>
                      <div className="text-zinc-400 pl-4">nums = [2, 7, 11]</div>
                      <div className="text-blue-400 pl-4">return <span className="text-zinc-300">[0, 1]</span></div>
                    </div>
                  )}
                  {accent === "rose" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-zinc-400">Violations: </span>
                      <span className="text-amber-400 font-bold">1/3</span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-zinc-100 mb-1">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/*  BENEFITS  */}
      <section id="why-codearena" className="relative z-10 py-24 px-6 md:px-12 border-y border-zinc-800/40 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Why CodeArena</p>
            <h2 className="text-4xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Practice that actually
              <br />
              <span className="text-zinc-400">translates to interviews</span>
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Solving LeetCode alone doesn't prepare you for the real thing. Interviews are timed,
              high-pressure, and observed. CodeArena simulates exactly that — except the stakes are lower
              and the reps are unlimited.
            </p>
            <div className="space-y-3">
              {[
                "Time pressure forces efficient thinking",
                "Opponent presence raises your focus",
                "Anti-cheat guarantees honest practice",
                "Leaderboard feedback measures real progress",
              ].map(b => (
                <div key={b} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  {b}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Target,     label: "Interview Ready",  desc: "Simulate real interview conditions",   accent: "emerald" },
                { icon: Zap,        label: "Speed Training",   desc: "Code faster with every battle",        accent: "amber"   },
                { icon: Lock,       label: "Fair Play",        desc: "Anti-cheat for honest results",        accent: "rose"    },
                { icon: Globe,      label: "Global Opponents", desc: "Match against players worldwide",      accent: "blue"    },
              ].map(({ icon: Icon, label, desc, accent }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.03 }}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-${accent}-500/10 mb-3`}>
                    <Icon className={`h-4 w-4 text-${accent}-400`} />
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 mb-1">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/*  TESTIMONIALS  */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Social Proof</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Trusted by
            <br />
            <span className="text-zinc-400">competitive coders</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          {TESTIMONIALS.map(({ name, handle, text, rating }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{handle}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/*  FINAL CTA  */}
      <section className="relative z-10 py-28 px-6 md:px-12">
        <Reveal>
          <div className="relative max-w-3xl mx-auto text-center rounded-3xl border border-zinc-800 bg-zinc-900/60 p-14 overflow-hidden">
            {/* Corner glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8">
                <Swords className="h-3.5 w-3.5" />
                Free to start — no credit card
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
                Ready to prove
                <br />
                <span className="text-emerald-400">what you're worth?</span>
              </h2>
              <p className="text-zinc-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
                Create your account, challenge an opponent, and see where you stand on the global leaderboard.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href="/sign-up"
                  className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                >
                  Enter the arena
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a href="/sign-in" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  Already have an account →
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/*  FOOTER  */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <Swords className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">code<span className="text-emerald-400">arena</span></span>
          </div>
          <div className="flex items-center gap-8 text-xs text-zinc-500">
            {["Features", "Leaderboard", "History", "Privacy", "Terms"].map(l => (
              <a key={l} href="#" className="hover:text-zinc-300 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors"><Twitter className="h-4 w-4" /></a>
            <span className="text-zinc-700 text-xs font-mono">v1.0.0</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-zinc-800/40 text-center">
          <p className="text-xs text-zinc-600">© 2026 CodeArena. Built for coders who compete.</p>
        </div>
      </footer>
    </div>
  );
}