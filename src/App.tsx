import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import BattleArena from "./pages/BattleArena";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/battle/:roomCode" element={<BattleArena />} />
        {/* temp shortcut so you don't need to type a roomCode */}
        <Route path="/battle" element={<BattleArena />} />
      </Routes>
    </BrowserRouter>
  );
}