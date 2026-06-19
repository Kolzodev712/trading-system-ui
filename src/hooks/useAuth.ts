import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { login, verifySession } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !token) return;
    void verifySession(token).then((user) => {
      if (!user) clear();
    });
  }, [hydrated, token, clear]);

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      toast.success(`Welcome, ${data.user.username}`);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    },
  });

  const logout = () => {
    clear();
    toast.info("Signed out");
  };

  return {
    login: loginMutation.mutate,
    loggingIn: loginMutation.isPending,
    logout,
    hydrated,
  };
}
