import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import BattleArena from "./pages/Arena";
import HomePage from "./pages/DashBoard";
import LeaderboardPage from "./pages/Leaderboard";
import WaitingRoom from "./pages/Waitingroom";
import {
  AuthenticateWithRedirectCallback,
  useAuth 
} from "@clerk/react";
import BattleRoom from "./pages/Lobby";
import BattleHistory from "./pages/History";
import Results from "./pages/Results";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";



const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

const SignedOutOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/sign-in/*" element={<SignedOutOnlyRoute><SignInPage /></SignedOutOnlyRoute>} />
        <Route path="/sign-up/*" element={<SignedOutOnlyRoute><SignUpPage /></SignedOutOnlyRoute>} />
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/landing" element={<SignedOutOnlyRoute><LandingPage /></SignedOutOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/battle/:roomCode" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
        <Route path="/waiting/:roomCode" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/battle-room" element={<ProtectedRoute><BattleRoom /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
        <Route path="/results/:roomCode" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}