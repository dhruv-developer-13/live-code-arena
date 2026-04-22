import { useQuery } from "@tanstack/react-query";
import { userApi, historyApi, leaderboardApi } from "@/lib/api";
import type { UserStats, RecentBattle, BattleHistory, LeaderboardEntry, LeaderboardStats, MyRank } from "@/lib/api";

const defaultUserStats: UserStats = { battlesWon: 0, totalBattles: 0, winRate: 0, avgScore: 0, totalPoints: 0 };
const defaultRecentBattles: RecentBattle[] = [];
const defaultHistory: BattleHistory = { battles: [], stats: { totalBattles: 0, wins: 0, losses: 0, winRate: 0, avgScore: 0 } };

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data } = await userApi.getStats();
      return data || defaultUserStats;
    },
    staleTime: 30000,
  });
}

export function useRecentBattles() {
  return useQuery<RecentBattle[]>({
    queryKey: ["recentBattles"],
    queryFn: async () => {
      const { data } = await userApi.getRecentBattles();
      return data || defaultRecentBattles;
    },
    staleTime: 30000,
  });
}

export function useHistory(filter?: string) {
  return useQuery<BattleHistory>({
    queryKey: ["history", filter],
    queryFn: async () => {
      const { data } = await historyApi.getAll(filter);
      return data || defaultHistory;
    },
    staleTime: 30000,
  });
}

export function useLeaderboard(period: string = "all") {
  return useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const { data } = await leaderboardApi.getLeaderboard(period, 10);
      return data || { leaderboard: [] };
    },
    staleTime: 30000,
  });
}

export function useMyRank() {
  return useQuery<MyRank>({
    queryKey: ["myRank"],
    queryFn: async () => {
      const { data } = await leaderboardApi.getMyRank();
      return data || { rank: 0, username: "", score: 0, battlesWon: 0, totalBattles: 0, winRate: 0 };
    },
    staleTime: 30000,
  });
}

export function usePlatformStats() {
  return useQuery<LeaderboardStats>({
    queryKey: ["platformStats"],
    queryFn: async () => {
      const { data } = await leaderboardApi.getStats();
      return data || { totalPlayers: 0, battlesThisWeek: 0 };
    },
    staleTime: 30000,
  });
}