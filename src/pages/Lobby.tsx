import { Swords, Plus, LogIn, Clock, Trophy, ShieldAlert, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { CreateJoinRoom } from "@/components/CreateJoinRoom";
import { Badge } from "@/components/ui/badge";
import { PageBackground } from "@/components/PageBackground";

const CREATE_RULES = [
  { icon: Zap,         text: "A unique 6-character room code is generated instantly" },
  { icon: Clock,       text: "45 minutes on the clock once both players ready up" },
  { icon: Trophy,      text: "3 problems — Easy (100pts), Medium (200pts), Hard (300pts)" },
  { icon: ShieldAlert, text: "Anti-cheat active — copy/paste and tab switching monitored" },
];

const JOIN_RULES = [
  { icon: LogIn,       text: "Get the room code from whoever created the room" },
  { icon: Zap,         text: "Both players must click Ready before the battle starts" },
  { icon: ShieldAlert, text: "Leaving mid-battle forfeits the match immediately" },
  { icon: Clock,       text: "Make sure you're on a stable connection before joining" },
];

export default function BattleRoom() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBackground />
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Swords className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Battle Room</h1>
            <p className="text-sm text-muted-foreground">Create or join a 1v1 coding battle</p>
          </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold gap-1.5 border-emerald-500/30 text-success bg-emerald-500/8 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Matches live
          </Badge>
        </div>

        {/* Create + Join component */}
        <Card className="rounded-2xl">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-sm font-bold">Start a Battle</CardTitle>
            
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <CreateJoinRoom />
          </CardContent>
        </Card>

        {/* Instructions grid */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Create rules */}
          <Card className="rounded-2xl">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-bold">Creating a Room</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {CREATE_RULES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Join rules */}
          <Card className="rounded-2xl">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <LogIn className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-bold">Joining a Room</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {JOIN_RULES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* General rules */}
        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5">
          <CardContent className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-bold text-warning">General Rules</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Right-click is disabled during battles",
                "Copy/paste is blocked in the code editor",
                "Tab switching is recorded as a violation",
                "3 violations results in disqualification",
                "Fullscreen mode is required throughout",
                "Python 3 is the only supported language",
              ].map((rule, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {rule}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}