import { useState } from "react";
import { Plus, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";

export function CreateJoinRoom() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [roomInput, setRoomInput] = useState("");

  const username =
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "player";

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/waiting/${code}?role=host&username=${username}`);
  };

  const joinRoom = () => {
    navigate(`/waiting/${roomInput}?role=guest&username=${username}`);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {/* Create room */}
      <button
        onClick={createRoom}
        className="group flex items-center gap-3 p-4 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-200 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
          <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Create Room</p>
          <p className="text-xs text-muted-foreground mt-0.5">Start a new battle and invite someone</p>
        </div>
      </button>

      {/* Join room */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
            maxLength={8}
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono font-semibold tracking-widest placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-foreground"
          />
          <button
            onClick={joinRoom}
            disabled={roomInput.length < 4}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
