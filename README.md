# CodeArena

A real-time 1v1 competitive coding platform where two players battle head-to-head solving algorithmic problems under a 45-minute timer.

---

## Tech Stack

- **Frontend** — React + TypeScript + Vite
- **Styling** — Tailwind CSS + shadcn/ui
- **Routing** — React Router v6
- **Toasts** — Sonner
- **Icons** — Lucide React
- **Real-time** — WebSocket (backend, TBD)

---

## Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Shared nav with logo, links, theme toggle, profile
│   └── ui/                 # shadcn components (button, resizable, sonner...)
├── pages/
│   ├── Index.tsx           # Dashboard / home (post-login)
│   ├── BattleArena.tsx     # Live coding battle page
│   ├── WaitingRoom.tsx     # Pre-battle lobby with ready system
│   └── Leaderboard.tsx     # Global rankings
├── data/
│   └── problems.json       # Mock problem set (Easy / Medium / Hard)
├── lib/
│   └── utils.ts            # cn() helper
└── App.tsx                 # Routes + Toaster
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard (Index) |
| `/waiting/:roomCode` | Waiting Room |
| `/battle/:roomCode` | Battle Arena |
| `/leaderboard` | Leaderboard |
| `/profile` | User Profile |
| `/results/:roomCode` | Post-battle Results (TBD) |

---

## Current State

### Done
- [x] Dashboard with stats, recent battles, create/join room
- [x] Waiting room with ready system
- [x] Battle arena with 45-min timer, Python-only editor
- [x] Anti-cheat: copy/paste blocked in editor and problem panel
- [x] Resizable problem/editor panels
- [x] Live score panel with animations
- [x] Leaderboard with podium + table
- [x] Dark/light mode toggle
- [x] Shared Header component

### TODO / Backend needed
- [ ] Auth (login / signup)
- [ ] Real WebSocket for opponent score sync
- [ ] Code execution engine
- [ ] Room matchmaking
- [ ] Results page after battle ends
- [ ] Real user data from DB (all hardcoded currently)

---

## Notes

All user data, battle history, and leaderboard entries are **hardcoded mock data** for now. Look for `// TODO:` comments throughout the codebase to find every place that needs a real DB/API call swapped in.
