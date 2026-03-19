import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Swords,
  ArrowRight,
  Play,
  Check,
  Github,
  Twitter,
  ChevronRight,
  Target,
  Zap,
  Lock,
  Globe,
  Star,
} from "lucide-react";
import { PageBackground } from "@/components/PageBackground";
import { FEATURES } from "@/data/features";
import { STEPS } from "@/data/steps";
import { TESTIMONIALS } from "@/data/testimonials";
import { STATS } from "@/data/stats";
import { BattlePreview } from "@/components/landing/BattlePreview";
import { Reveal } from "@/components/landing/Reveal";
import { accentMap } from "@/lib/accentMap";
import { Badge } from "@/components/ui/badge-custom";
import { Section } from "@/components/ui/section";
import { CardContainer } from "@/components/ui/card-container";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {/*  Grid noise background  */}
      <PageBackground />

      {/*  NAV  */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            code<span className="text-emerald-400">arena</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {["Features", "How it Works", "Interface", "Why CodeArena"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleButton/>
          <a href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</a>
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
            className="flex justify-center mb-8"
          >
            <Badge accent="emerald" variant="outline" pulse icon={<Swords className="h-3.5 w-3.5" />}>
              Live battles happening now
            </Badge>
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
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary text-foreground hover:text-foreground font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
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
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/*  STATS  */}
      <section className="relative z-10 border-y border-border/60 bg-card/30 py-10 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 0.08} className="text-center">
              <p className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/*  FEATURES  */}
      <Section id="features" container="default" className="py-24">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Platform Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built for serious
            <br />
            <span className="text-muted-foreground">competitive coders</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <motion.div
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group cursor-default overflow-hidden transition-colors duration-300"
              >
                <CardContainer interactive padded="md">
                  {/* Hover glow */}
                  <AnimatePresence>
                    {hoveredFeature === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: `var(--color-${accent})` }}
                      />
                    )}
                  </AnimatePresence>

                  <div className={`relative z-10 inline-flex p-2.5 rounded-xl ${accentMap[accent].bg} border ${accentMap[accent].border} mb-4`}>
                    <Icon className={`h-5 w-5 ${accentMap[accent].text}`} />
                  </div>
                  <h3 className="relative z-10 text-base font-semibold text-foreground mb-2">{title}</h3>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContainer>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/*  HOW IT WORKS  */}
      <Section id="how-it-works" background="card-subtle" divided container="narrow" className="py-24">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            From zero to battle
            <br />
            <span className="text-muted-foreground">in 60 seconds</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc, icon: Icon }, i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-6 h-px bg-border z-10" />
                )}
                <CardContainer variant="muted" padded="md">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs font-bold text-emerald-400">{n}</span>
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContainer>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/*  PRODUCT SHOWCASE  */}
      <Section id="interface" container="default" className="py-24">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Interface</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Every pixel
            <br />
            <span className="text-muted-foreground">built for focus</span>
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
                className="relative overflow-hidden group"
              >
                <CardContainer padded="md">
                  <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  {/* Mock UI element */}
                  <div className="relative z-10 mb-5 rounded-xl border border-border bg-background p-3 font-mono text-xs">
                    {accent === "emerald" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">You</span>
                          <span className="text-emerald-400 font-bold">350</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div className="h-full w-[70%] rounded-full bg-emerald-500" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Opponent</span>
                          <span className="text-rose-400 font-bold">280</span>
                        </div>
                      </div>
                    )}
                    {accent === "blue" && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground">def <span className="text-emerald-400">solution</span>():</div>
                        <div className="text-muted-foreground pl-4">nums = [2, 7, 11]</div>
                        <div className="text-blue-400 pl-4">return <span className="text-foreground">[0, 1]</span></div>
                      </div>
                    )}
                    {accent === "rose" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-muted-foreground">Violations: </span>
                        <span className="text-amber-400 font-bold">1/3</span>
                      </div>
                    )}
                  </div>
                  <p className="relative z-10 text-sm font-semibold text-foreground mb-1">{label}</p>
                  <p className="relative z-10 text-xs text-muted-foreground">{desc}</p>
                </CardContainer>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/*  BENEFITS  */}
      <Section id="why-codearena" background="card-subtle" divided container="narrow" className="py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Why CodeArena</p>
            <h2 className="text-4xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Practice that actually
              <br />
              <span className="text-muted-foreground">translates to interviews</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
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
                <div key={b} className="flex items-center gap-3 text-sm text-foreground">
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
              {(
                [
                  { icon: Target,     label: "Interview Ready" as const,  desc: "Simulate real interview conditions",   accent: "emerald" as const },
                  { icon: Zap,        label: "Speed Training" as const,   desc: "Code faster with every battle",        accent: "amber" as const   },
                  { icon: Lock,       label: "Fair Play" as const,        desc: "Anti-cheat for honest results",        accent: "rose" as const    },
                  { icon: Globe,      label: "Global Opponents" as const, desc: "Match against players worldwide",      accent: "blue" as const    },
                ] as const
              ).map(({ icon: Icon, label, desc, accent }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.03 }}
                >
                  <CardContainer variant="muted" padded="md">
                    <div className={`inline-flex p-2 rounded-lg ${accentMap[accent].bg} mb-3`}>
                      <Icon className={`h-4 w-4 ${accentMap[accent].text}`} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </CardContainer>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/*  TESTIMONIALS  */}
      <Section container="default" className="py-24">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-4">Social Proof</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Trusted by
            <br />
            <span className="text-muted-foreground">competitive coders</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          {TESTIMONIALS.map(({ name, handle, text, rating }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <CardContainer padded="md">
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
                </CardContainer>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/*  FINAL CTA  */}
      <Section container="default" className="py-28">
        <Reveal>
          <CardContainer variant="default" padded="lg" className="relative max-w-3xl mx-auto text-center overflow-hidden">
            {/* Corner glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <Badge accent="emerald" variant="outline" icon={<Swords className="h-3.5 w-3.5" />} className="mb-8 flex justify-center">
                Free to start — no credit card
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
                Ready to prove
                <br />
                <span className="text-emerald-400">what you're worth?</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto leading-relaxed">
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
                <a href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Already have an account →
                </a>
              </div>
            </div>
          </CardContainer>
        </Reveal>
      </Section>

      {/*  FOOTER  */}
      <footer className="relative z-10 border-t border-border/60 px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <Swords className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">code<span className="text-emerald-400">arena</span></span>
          </div>
          <div className="flex items-center gap-8 text-xs text-muted-foreground">
            {["Features", "Interface", "Privacy", "Terms"].map(l => (
              <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></a>
            <span className="text-border text-xs font-mono">v1.0.0</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">© 2026 CodeArena. Built for coders who compete.</p>
        </div>
      </footer>
    </div>
  );
}