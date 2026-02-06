import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { format } from "date-fns";

// === USER HOOKS ===

// Create or Get User
export function useCreateUser() {
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(api.users.getOrCreate.path, {
        method: api.users.getOrCreate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      
      if (!res.ok) throw new Error("Failed to create/get user");
      return api.users.getOrCreate.responses[200].parse(await res.json());
    },
  });
}

// === LOG HOOKS ===

// Get Weekly Stats
export function useWeeklyStats(userId: number | null) {
  return useQuery({
    queryKey: [api.logs.getWeekly.path, userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = buildUrl(api.logs.getWeekly.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weekly stats");
      return api.logs.getWeekly.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

// Create Log
export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, date, metadata }: { category: string; date: Date; metadata?: Record<string, unknown> }) => {
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, date: formattedDate, metadata }),
      });

      if (!res.ok) throw new Error("Failed to log activity");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate weekly stats to refresh UI
      queryClient.invalidateQueries({ queryKey: [api.logs.getWeekly.path] });
    },
  });
}
