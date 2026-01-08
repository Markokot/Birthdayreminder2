import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type LoginRequest } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await apiRequest(
        api.auth.login.method,
        api.auth.login.path,
        credentials
      );
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      await queryClient.invalidateQueries({ queryKey: [api.birthdays.list.path] });
      setLocation("/");
      toast({
        title: "С возвращением!",
        description: "Вы успешно вошли в систему.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: "Неверное имя пользователя или пароль.",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest(api.auth.logout.method, api.auth.logout.path);
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/login");
    },
  });
}
