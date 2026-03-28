import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Check, Loader2, Swords, LogOut, Users, Shield, ShieldAlert, Zap, Clock, ShieldCheck, Share2 } from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { PageBackground } from "@/components/PageBackground";

interface Player {
  id: string;
  name: string;
  username: string;
  isReady: boolean;
  isHost: boolean;
}

const ANTI_CHEAT_RULES = [
  { icon: ShieldAlert, text: "Fullscreen required throughout the battle" },
  { icon: Zap, text: "Copy/paste blocked in the code editor" },
  { icon: Clock, text: "Tab switching records a violation (max 3)" },
  { icon: ShieldCheck, text: "Right-click disabled during the match" },
];

export default function WaitingRoom() {
  const { user } = useAuth();
  const { battleId } = useParams<{ battleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomCode = searchParams.get("roomCode") || "";
  const clerkName = user?.username || "Player";
  const clerkUsername = user?.username || "player";

  const role = searchParams.get("role") ?? "host";
  const urlUsername = searchParams.get("username") ?? clerkUsername;
  const isHost = role === "host";

  const mySocketId = isHost ? "1" : "2";
  const currentPlayerName = isHost ? clerkName : urlUsername;
  const currentPlayerUsername = isHost ? clerkUsername : urlUsername;

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    {
      id: mySocketId,
      name: currentPlayerName,
      username: currentPlayerUsername,
      isReady: false,
      isHost,
    },
  ]);

  const socketRef = useRef<Socket | null>(null);
  const myPlayer = players.find((p) => p.id === mySocketId);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      auth: { token: localStorage.getItem("token") || undefined },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("waiting_room_join", {
        roomCode,
        username: currentPlayerUsername,
      });
    });

    socket.on("opponent_joined", ({ player }: { player: { userId: string; username: string } }) => {
      const opponentId = mySocketId === "1" ? "2" : "1";
      setPlayers((prev) => {
        if (prev.find((p) => p.id === opponentId)) return prev;
        return [
          ...prev,
          {
            id: opponentId,
            name: player.username,
            username: player.username,
            isReady: false,
            isHost: !isHost,
          },
        ];
      });
      toast("Opponent joined!", { description: `${player.username} has entered the arena.` });
    });

    socket.on("opponent_ready", ({ isReady }: { isReady: boolean }) => {
      const opponentId = mySocketId === "1" ? "2" : "1";
      setPlayers((prev) =>
        prev.map((p) => (p.id === opponentId ? { ...p, isReady } : p))
      );
      if (isReady) toast("Opponent is ready!");
      
      // If both ready and guest, auto emit battle:join
      if (isReady && !isHost && battleId) {
        socket.emit("battle:join", { battleId });
      }
    });

    socket.on("opponent_disconnected", () => {
      const opponentId = mySocketId === "1" ? "2" : "1";
      setPlayers((prev) => prev.filter((p) => p.id !== opponentId));
      toast.error("Opponent disconnected.");
    });

    socket.on("battle:start", () => {
      console.log("Received battle:start, navigating to arena...");
      if (battleId && !isStarting) {
        setIsStarting(true);
        navigate(`/arena/${battleId}?userId=${mySocketId}&username=${currentPlayerUsername}`);
      }
    });

    socket.on("guest_ready_to_battle", () => {
      console.log("Received guest_ready_to_battle");
      if (battleId) {
        socket.emit("battle:join", { battleId });
      }
    });

    return () => { socket.disconnect(); };
  }, [roomCode, mySocketId, currentPlayerUsername, isHost, battleId, navigate]);

  // Polling as fallback for battle start
  useEffect(() => {
    if (!battleId || isStarting) return;
    
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/api/battles/${battleId}`);
        console.log("Polling status:", res.data);
        if (res.data.status === "ONGOING") {
          setIsStarting(true);
          navigate(`/arena/${battleId}?userId=${mySocketId}&username=${currentPlayerUsername}`);
        }
      } catch {
        // Ignore errors, keep polling
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [battleId, isStarting, mySocketId, currentPlayerUsername, navigate]);

  const toggleReady = () => {
    const newReady = !myPlayer?.isReady;
    setPlayers((prev) =>
      prev.map((p) => (p.id === mySocketId ? { ...p, isReady: newReady } : p))
    );
    socketRef.current?.emit("player_ready", {
      roomCode,
      isReady: newReady,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const message = `⚔️ Live Code Arena Battle Invite\n👤 Host: ${currentPlayerUsername}\n🎯 Room Code: ${roomCode}\nThink you can beat me? 😏\nJoin the battle and prove your coding skills!`;
    if (navigator.share) {
      await navigator.share({ title: "CodeArena Battle Invite", text: message });
    } else {
      await navigator.clipboard.writeText(message);
      toast("Invite copied!", { description: "Share it with your opponent." });
    }
  };

  const handleStart = async () => {
    if (!battleId || !isHost) return; // Only host can start
    setIsStarting(true);
    socketRef.current?.emit("battle:join", { battleId });
    // Host will navigate when receiving battle:start
  };

  const allReady = players.length === 2 && players.every((p) => p.isReady);

  const normalizedPlayers = players.map((p) =>
    isHost && p.id === "1" ? { ...p, name: clerkName, username: clerkUsername } : p
  );

  const sortedPlayers = [...normalizedPlayers].sort((a, b) => {
    if (a.isHost === b.isHost) return 0;
    return a.isHost ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBackground />
      <main className="relative z-10 max-w-xl mx-auto px-6 py-12 space-y-6">

        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Swords className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Waiting Room</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Share the code to invite your opponent</p>
          </div>
        </div>

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
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
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

        <Card className="rounded-2xl overflow-hidden gap-0 py-0">
          <CardHeader className="grid-cols-[1fr_auto] grid-rows-1 items-center gap-2 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-bold text-foreground whitespace-nowrap">Players</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground font-normal whitespace-nowrap">{players.length}/2</span>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {sortedPlayers.map((player) => (
              <div
                key={player.id}
                onClick={player.id === mySocketId ? toggleReady : undefined}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  player.id === mySocketId && "cursor-pointer",
                  player.isReady ? "bg-emerald-500/5 border-emerald-500/25" : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center text-sm font-black",
                    player.isHost
                      ? "bg-emerald-500/15 border-emerald-500/30 text-success"
                      : "bg-blue-500/15 border-blue-500/30 text-info"
                  )}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{player.name}</p>
                      {player.isHost && (
                        <Badge className="text-xs bg-emerald-500/10 text-success px-2 py-0.5 rounded-full font-semibold border-0 shadow-none">
                          Host
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{player.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {player.isReady
                    ? <><ShieldCheck className="h-4 w-4 text-emerald-500" /><span className="text-success">Ready</span></>
                    : <><Shield className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Not Ready</span></>
                  }
                </div>
              </div>
            ))}

            {players.length === 1 && (
              <div className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Waiting for opponent…</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className={cn(
          "text-center text-sm font-medium transition-colors",
          allReady ? "text-success" : "text-muted-foreground"
        )}>
          {!myPlayer?.isReady && "Click \"Ready Up\" when you're set to go"}
          {myPlayer?.isReady && !allReady && "Waiting for opponent to ready up…"}
          {allReady && "Both players ready — let's battle!"}
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleReady}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200",
              myPlayer?.isReady
                ? "bg-emerald-500/10 border-emerald-500/30 text-success hover:bg-emerald-500/15"
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
            disabled={!allReady || isStarting || !isHost}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200"
          >
            {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
            {isStarting ? "Starting…" : isHost ? "Start Battle" : "Waiting for host…"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </button>
        </div>

        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/[0.03]">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-xs font-semibold text-warning">
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
