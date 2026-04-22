import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Arena from "./pages/Arena.dev";
import HomePage from "./pages/DashBoard";
import LeaderboardPage from "./pages/Leaderboard";
import WaitingRoom from "./pages/Waitingroom";
import { useAuth } from "@/context/AuthContext";
import BattleRoom from "./pages/Lobby";
import BattleHistory from "./pages/History";
import Results from "./pages/Results";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import SSOCallback from "./auth/SSOCallBack";
import { AuthProvider } from "./context/AuthContext";


const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
};

const SignedOutOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/sign-in/*" element={<SignedOutOnlyRoute><SignInPage /></SignedOutOnlyRoute>} />
        <Route path="/sign-up/*" element={<SignedOutOnlyRoute><SignUpPage /></SignedOutOnlyRoute>} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/landing" element={<SignedOutOnlyRoute><LandingPage /></SignedOutOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/battle-room" element={<ProtectedRoute><BattleRoom /></ProtectedRoute>} />
        <Route path="/waiting/:battleId" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/arena/:battleId" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
        <Route path="/results/:battleId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
