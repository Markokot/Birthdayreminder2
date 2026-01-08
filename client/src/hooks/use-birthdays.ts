import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBirthday } from "@shared/routes";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

export function useBirthdays() {
  return useQuery({
    queryKey: [api.birthdays.list.path],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useCreateBirthday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBirthday) => {
      const res = await apiRequest(
        api.birthdays.create.method,
        api.birthdays.create.path,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.birthdays.list.path] });
    },
  });
}

export function useUpdateBirthday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertBirthday>) => {
      const url = buildUrl(api.birthdays.update.path, { id });
      const res = await apiRequest(
        api.birthdays.update.method,
        url,
        updates
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.birthdays.list.path] });
    },
  });
}

export function useDeleteBirthday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.birthdays.delete.path, { id });
      await apiRequest(
        api.birthdays.delete.method,
        url
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.birthdays.list.path] });
    },
  });
}
