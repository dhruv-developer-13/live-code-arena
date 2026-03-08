import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import BattleArena from "./pages/BattleArena";
import HomePage from "./pages";
import LeaderboardPage from "./pages/Leaderboard";
import WaitingRoom from "./pages/Waitingroom";
import { SignIn, SignUp, Show, RedirectToSignIn } from "@clerk/react";

export default function App() {
  const ProtectedRoute = ({ children }: { children: ReactNode }) => (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      {children}
    </Show>
  );
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>

        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/battle/:roomCode" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
        <Route path="/battle" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
        <Route path="/waiting/:roomCode" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}