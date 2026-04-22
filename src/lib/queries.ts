import { useMutation, useQuery } from "@tanstack/react-query";
import { battleApi, aiApi } from "./api";

export function useCreateBattle() {
  return useMutation({
    mutationFn: () => battleApi.create(),
  });
}

export function useJoinBattle() {
  return useMutation({
    mutationFn: ({ roomCode }: { roomCode: string }) =>
      battleApi.join(roomCode),
  });
}

export function useRunCode(battleId: string, questionId: string) {
  return useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) =>
      battleApi.run(battleId, questionId, code, language),
  });
}

export function useSubmitCode(battleId: string, questionId: string) {
  return useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) =>
      battleApi.submit(battleId, questionId, code, language),
  });
}

export function useBattleResults(battleId: string, enabled = true) {
  return useQuery({
    queryKey: ["battleResults", battleId],
    queryFn: () => battleApi.getResults(battleId),
    enabled: enabled && !!battleId,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data?.data?.data;
      const status = data?.status;
      if (status === "ONGOING") return 2000;
      if (!data?.aiReview) return 2000;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}

export function useAIReview() {
  return useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) =>
      aiApi.review(code, language),
  });
}
