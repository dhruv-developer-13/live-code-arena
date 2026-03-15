import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Check, Loader2, Swords, LogOut, Users, Shield, ShieldAlert, Zap, Clock, ShieldCheck, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Player {
  id: string;
  name: string;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

// Hardcoded opponent — will be real via WebSocket later
const OPPONENT: Player = {
  id: "2",
  name: "CodeNinja99",
  username: "codeninja99",
  isReady: false,
  isHost: false,
};

const ANTI_CHEAT_RULES = [
  { icon: ShieldAlert, text: "Fullscreen required throughout the battle"   },
  { icon: Zap,         text: "Copy/paste blocked in the code editor"       },
  { icon: Clock,       text: "Tab switching records a violation (max 3)"   },
  { icon: ShieldCheck, text: "Right-click disabled during the match"       },
];

export default function WaitingRoom() {
  const { user } = useUser();
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const currentPlayerName =
    user?.fullName || user?.firstName || user?.username || "Player";
  const currentPlayerUsername =
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "player";

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      name: currentPlayerName,
      username: currentPlayerUsername,
      isReady: false,
      isHost: true,
    },
  ]);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === "1"
          ? { ...p, name: currentPlayerName, username: currentPlayerUsername }
          : p
      )
    );
  }, [currentPlayerName, currentPlayerUsername]);

  // Simulate opponent joining after 2.5s
  useEffect(() => {
    const t = setTimeout(() => {
      setPlayers((prev) => {
        const me = prev.find((p) => p.id === "1") ?? {
          id: "1",
          name: currentPlayerName,
          username: currentPlayerUsername,
          isReady: false,
          isHost: true,
        };
        return [me, { ...OPPONENT, isReady: false }];
      });
      toast("Opponent joined!", { description: `${OPPONENT.name} has entered the arena.` });
    }, 2500);
    return () => clearTimeout(t);
  }, [currentPlayerName, currentPlayerUsername]);

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

  const handleShare = async () => {
    const message =
      `⚔️ Live Code Arena Battle Invite
👤 Host: ${currentPlayerUsername}
🎯 Room Code: ${roomCode}
Think you can beat me? 😏
Join the battle and prove your coding skills!`;

    if (navigator.share) {
      await navigator.share({ title: "CodeArena Battle Invite", text: message });
    } else {
      await navigator.clipboard.writeText(message);
      toast("Invite copied!", { description: "Share it with your opponent." });
    }
  };

  const handleStart = async () => {
    setIsStarting(true)
    await new Promise((r) => setTimeout(r, 900))
    navigate(`/battle/${roomCode}?userId=1&username=${currentPlayerUsername}`)
  }

  const allReady = players.length === 2 && players.every((p) => p.isReady);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
      </div>
      <main className="relative z-10 max-w-xl mx-auto px-6 py-12 space-y-6">

      {/*  Page Header  */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Swords className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Waiting Room</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Share the code to invite your opponent</p>
          </div>
        </div>

        {/*  Room Code  */}
        <Card className="rounded-2xl gap-0 py-0 p-8 text-center space-y-4">
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
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-border bg-muted hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
              title="Share invite"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with your opponent to let them join
          </p>
        </Card>

        {/*  Players  */}
        <Card className="rounded-2xl overflow-hidden gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between gap-2 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-bold text-foreground">
                Players
              </CardTitle>
            </div>
            <span className="ml-2 text-muted-foreground font-normal">{players.length}/2</span>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
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
                        <Badge className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold border-0 shadow-none">
                          Host
                        </Badge>
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
          </CardContent>
        </Card>

        {/*  Status hint  */}
        <div className={cn(
          "text-center text-sm font-medium transition-colors",
          allReady ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
        )}>
          {!myPlayer?.isReady && "Click \"Ready Up\" when you're set to go"}
          {myPlayer?.isReady && !allReady && "Waiting for opponent to ready up…"}
          {allReady && "Both players ready — let's battle!"}
        </div>

        {/*  Actions  */}
        <div className="flex gap-3">
           {/* Ready toggle */}
            <button
              onClick={toggleReady}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200",
                myPlayer?.isReady
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                  : "bg-muted border-border text-foreground hover:bg-muted/70"
              )}
            >
              {myPlayer?.isReady
                ? <><ShieldCheck className="h-4 w-4" /> Unready</>
                : <><Shield className="h-4 w-4" /> Ready Up</>
              }
            </button>
 
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

        {/*  Anti-cheat reminder  */}
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/[0.03]">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Anti-cheat is active during battles
              </p>
            </div>
            <div className="space-y-2">
              {ANTI_CHEAT_RULES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon className="h-3 w-3 text-amber-500/60 shrink-0" />
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}