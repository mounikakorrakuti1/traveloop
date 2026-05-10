import { useEffect } from "react";
import { getMe } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

/** Hydrates session from HttpOnly cookie (or BYPASS_AUTH) on app mount */
export function AuthBootstrap({ children }) {
  const setUser    = useAuthStore((s) => s.setUser);
  const doLogout   = useAuthStore((s) => s.logout);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    void getMe()
      .then((user) => setUser(user))
      .catch(() => doLogout())
      .finally(() => setHydrated(true));
  }, [setUser, doLogout, setHydrated]);

  return children;
}
