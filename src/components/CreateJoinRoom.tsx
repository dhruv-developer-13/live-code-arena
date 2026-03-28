import { useState } from "react";
import { Plus, LogIn, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCreateBattle, useJoinBattle } from "@/lib/queries";
import { toast } from "sonner";

export function CreateJoinRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomInput, setRoomInput] = useState("");

  const username = user?.username || "player";

  const createBattle = useCreateBattle();
  const joinBattle = useJoinBattle();

  const handleCreate = async () => {
    try {
      const response = await createBattle.mutateAsync();
      const { battleId, roomCode } = response.data;
      navigate(`/waiting/${battleId}?role=host&roomCode=${roomCode}&username=${username}`);
    } catch (error) {
      toast.error("Failed to create battle");
    }
  };

  const handleJoin = async () => {
    if (roomInput.length < 6) return;
    try {
      const response = await joinBattle.mutateAsync({ roomCode: roomInput });
      const { battleId } = response.data;
      navigate(`/waiting/${battleId}?role=guest&roomCode=${roomInput}&username=${username}`);
    } catch (error) {
      toast.error("Failed to join battle");
    }
  };

  const isLoading = createBattle.isPending || joinBattle.isPending;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <button
        onClick={handleCreate}
        disabled={isLoading}
        className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-200 text-left disabled:opacity-50"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
          {createBattle.isPending ? (
            <Loader2 className="h-5 w-5 text-success animate-spin" />
          ) : (
            <Plus className="h-5 w-5 text-success" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Create Room</p>
          <p className="text-xs text-muted-foreground mt-0.5">Start a new battle</p>
        </div>
      </button>

      <div className="flex flex-col gap-2 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <LogIn className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Join Room</p>
            <p className="text-xs text-muted-foreground mt-0.5">Enter a room code</p>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            minLength={6}
            maxLength={6}
            disabled={isLoading}
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono font-semibold tracking-widest placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-foreground disabled:opacity-50"
          />
          <button
            onClick={handleJoin}
            disabled={roomInput.length < 6 || joinBattle.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {joinBattle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
