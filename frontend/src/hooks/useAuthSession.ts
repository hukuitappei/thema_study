import { useEffect, useState } from "react";
import type { components } from "../generated/schema";
import { apiClient, setAccessToken } from "../lib/api";

type UserProfile = components["schemas"]["UserProfile"];

export type AuthMode = "checking" | "anonymous" | "authenticated";

const tokenStorageKey = "thema_auth_token";

export function persistAccessToken(token: string | null) {
  setAccessToken(token);

  if (token) {
    window.localStorage.setItem(tokenStorageKey, token);
    return;
  }

  window.localStorage.removeItem(tokenStorageKey);
}

export function useAuthSession() {
  const [authMode, setAuthMode] = useState<AuthMode>("checking");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const storedToken = window.localStorage.getItem(tokenStorageKey);

      if (!storedToken) {
        if (active) {
          setAuthMode("anonymous");
        }
        return;
      }

      setAccessToken(storedToken);
      try {
        const me = await apiClient.getMe();
        if (!active) {
          return;
        }

        setUser(me);
        setAuthMode("authenticated");
        setAuthNotice(`ログイン中: ${me.display_name}`);
      } catch {
        persistAccessToken(null);
        if (!active) {
          return;
        }

        setUser(null);
        setAuthMode("anonymous");
        setAuthNotice(
          "保存されていたセッションは無効でした。再度ログインしてください。",
        );
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  function authenticate(nextUser: UserProfile, token?: string) {
    if (token) {
      persistAccessToken(token);
    }
    setUser(nextUser);
    setAuthMode("authenticated");
  }

  function clearSession(notice: string) {
    persistAccessToken(null);
    setUser(null);
    setAuthMode("anonymous");
    setAuthNotice(notice);
  }

  return {
    authMode,
    authNotice,
    authenticate,
    clearSession,
    setAuthNotice,
    user,
  };
}
