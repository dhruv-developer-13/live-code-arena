import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import BattleArena from "./pages/BattleArena";
import HomePage from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/battle/:roomCode" element={<BattleArena />} />
        {/* temp shortcut so you don't need to type a roomCode */}
        <Route path="/battle" element={<BattleArena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}