import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),
};

export interface BattleCreateResponse {
  battleId: string;
  roomCode: string;
}

export interface BattleJoinResponse {
  battleId: string;
}

export interface RunResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTimeMs: number;
  memoryUsedMb: number;
}

export interface SubmitResult {
  passed: number;
  total: number;
  points: number;
  multiplier: number;
  previousMax: number;
  improved: boolean;
}

export interface SampleCase {
  input: string;
  expectedOutput: string;
  testCaseNumber: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  tags: string[];
  sampleCases: SampleCase[];
}

export interface QuestionAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: string;
  improvements: string[];
}

export interface QuestionReviewData {
  title: string;
  difficulty: string;
  player1: QuestionAnalysis;
  player2: QuestionAnalysis;
  bonusReason: string;
}

export interface PlayerReviewDetail {
  totalBonus: number;
  strengths: string[];
  improvements: string[];
}

export interface AIReviewResult {
  questions: QuestionReviewData[];
  player1: PlayerReviewDetail;
  player2: PlayerReviewDetail;
  motivational: string;
}

export interface BattlePlayer {
  id: string;
  username: string;
  baseScore: number;
  aiBonus: number;
  total: number;
  lastSubmissionTime?: string;
}

export interface BattleResults {
  battleId: string;
  status: string;
  message?: string;
  forfeitType?: "VOLUNTARY" | "VIOLATION" | "TIMEOUT" | "DISCONNECT" | null;
  forfeitedBy?: string | null;
  startedAt?: string;
  endedAt?: string;
  aiReview?: AIReviewResult;
  winner?: {
    id: string;
    username: string;
  };
  players?: {
    player1: BattlePlayer;
    player2: BattlePlayer;
  };
  questions?: Record<string, Question>;
  submissions?: {
    id: string;
    userId: string;
    questionId: string;
    question: { id: string; title: string; difficulty: string };
    code: string;
    language: string;
    testCasesPassed: number;
    pointsEarned: number;
    multiplierApplied: number;
    executionTimeMs: number;
    memoryUsedMb: number;
    submittedAt: string;
  }[];
}

export interface AIReviewResponse {
  text: string;
}

export const battleApi = {
  create: () => api.post<BattleCreateResponse>("/api/battles/create"),

  join: (roomCode: string) =>
    api.post<BattleJoinResponse>("/api/battles/join", { roomCode }),

  run: (
    battleId: string,
    questionId: string,
    code: string,
    language: string
  ) =>
    api.post<{ results: RunResult[] }>(
      `/api/battles/${battleId}/questions/${questionId}/run`,
      { code, language }
    ),

  submit: (
    battleId: string,
    questionId: string,
    code: string,
    language: string
  ) =>
    api.post<SubmitResult>(
      `/api/battles/${battleId}/questions/${questionId}/submit`,
      { code, language }
    ),

  getResults: (battleId: string) =>
    api.get<BattleResults>(`/api/battles/${battleId}/results`),

  forfeit: (battleId: string, reason?: "forfeit" | "violation") =>
    api.post<{ message: string }>(`/api/battles/${battleId}/forfeit`, { reason: reason || "forfeit" }),
};

export const aiApi = {
  review: (code: string, language: string) =>
    api.post<AIReviewResponse>("/ai/review", { prompt: `Review this ${language} code:\n\n${code}` }),
};

export interface UserStats {
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  avgScore: number;
  totalPoints: number;
}

export interface RecentBattle {
  id: string;
  opponent: string;
  result: "win" | "loss";
  myScore: number;
  theirScore: number;
  duration: string;
  difficulty: string;
  timestamp: string | null;
}

export interface BattleHistory {
  battles: RecentBattle[];
  stats: {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
    avgScore: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  streak?: number;
}

export interface LeaderboardStats {
  totalPlayers: number;
  battlesThisWeek: number;
}

export interface MyRank {
  rank: number;
  username: string;
  score: number;
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  streak?: number;
}

export const userApi = {
  getStats: () => api.get<UserStats>("/api/users/me/stats"),
  getRecentBattles: () => api.get<RecentBattle[]>("/api/users/me/recent-battles"),
};

export const historyApi = {
  getAll: (filter?: string) =>
    api.get<BattleHistory>("/api/history", { params: { filter } }),
};

export const leaderboardApi = {
  getLeaderboard: (period?: string, limit?: number) =>
    api.get<{ leaderboard: LeaderboardEntry[] }>("/api/leaderboard", { params: { period, limit } }),
  getMyRank: () => api.get<MyRank>("/api/leaderboard/me"),
  getStats: () => api.get<LeaderboardStats>("/api/leaderboard/stats"),
};
