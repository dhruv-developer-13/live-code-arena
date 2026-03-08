import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Check, Loader2, Swords, LogOut, Users, Shield, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

// TODO: replace with session user
const ME: Player = {
  id: "1",
  name: "Aryan",
  username: "aryan_dev",
  isReady: false,
  isHost: true,
};

// Hardcoded opponent — will be real via WebSocket later
const OPPONENT: Player = {
  id: "2",
  name: "CodeNinja99",
  username: "codeninja99",
  isReady: false,
  isHost: false,
};

export default function WaitingRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([ME]);
  const [opponentReady, setOpponentReady] = useState(false);

  // Simulate opponent joining after 2.5s
  useEffect(() => {
    const t = setTimeout(() => {
      setPlayers([ME, { ...OPPONENT, isReady: false }]);
      toast("Opponent joined!", { description: `${OPPONENT.name} has entered the arena.` });
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Once user is ready, opponent becomes ready after 1.5s
  const myPlayer = players.find((p) => p.id === "1");
  useEffect(() => {
    if (!myPlayer?.isReady || players.length < 2 || opponentReady) return;
    const t = setTimeout(() => {
      setOpponentReady(true);
      setPlayers((prev) =>
        prev.map((p) => (p.id === "2" ? { ...p, isReady: true } : p))
      );
      toast("Opponent is ready!", { description: "Both players ready — you can start." });
    }, 1500);
    return () => clearTimeout(t);
  }, [myPlayer?.isReady, players.length]);

  const toggleReady = () => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === "1" ? { ...p, isReady: !p.isReady } : p))
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode ?? "");
    setCopied(true);
    toast("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setIsStarting(true);
    await new Promise((r) => setTimeout(r, 900));
    navigate(`/battle/${roomCode}`);
  };

  const allReady = players.length === 2 && players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-xl mx-auto px-6 py-12 space-y-6">

        {/* ── Room Code ───────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Room Code
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl md:text-5xl font-black font-mono tracking-[0.25em] text-foreground">
              {roomCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl border border-border bg-muted hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied
                ? <Check className="h-4 w-4 text-emerald-500" />
                : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with your opponent to let them join
          </p>
        </div>

        {/* ── Players ─────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">
              Players
              <span className="ml-2 text-muted-foreground font-normal">{players.length}/2</span>
            </h3>
          </div>

          <div className="p-4 space-y-3">
            {/* Player rows */}
            {players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  player.isReady
                    ? "bg-emerald-500/5 border-emerald-500/25"
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center text-sm font-black",
                    player.isHost
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  )}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{player.name}</p>
                      {player.isHost && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{player.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ready status badge */}
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold",
                    player.isReady
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}>
                    {player.isReady
                      ? <ShieldCheck className="h-4 w-4" />
                      : <Shield className="h-4 w-4" />}
                    {player.isReady ? "Ready" : "Not Ready"}
                  </div>

                  {/* Toggle button — only for current user */}
                  {player.id === "1" && (
                    <button
                      onClick={toggleReady}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                        player.isReady
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25"
                          : "bg-muted hover:bg-muted/70 text-foreground border border-border"
                      )}
                    >
                      {player.isReady ? "Unready" : "Ready Up"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Waiting slot */}
            {players.length === 1 && (
              <div className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Waiting for opponent…</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Status hint ─────────────────────────────────────────────── */}
        <div className={cn(
          "text-center text-sm font-medium transition-colors",
          allReady ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}>
          {!myPlayer?.isReady && "Click \"Ready Up\" when you're set to go"}
          {myPlayer?.isReady && !allReady && "Waiting for opponent to ready up…"}
          {allReady && "Both players ready — let's go!"}
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            onClick={handleStart}
            disabled={!allReady || isStarting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200"
          >
            {isStarting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Swords className="h-4 w-4" />}
            {isStarting ? "Starting…" : "Start Battle"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </button>
        </div>
      </main>
    </div>
  );
}