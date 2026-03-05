import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import BattleArena from "./pages/BattleArena";
import HomePage from "./pages";
import LeaderboardPage from "./pages/Leaderboard";
import WaitingRoom from "./pages/Waitingroom";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/battle/:roomCode" element={<BattleArena />} />
        {/* temp shortcut so you don't need to type a roomCode */}
        <Route path="/battle" element={<BattleArena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/waiting/:roomCode" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}