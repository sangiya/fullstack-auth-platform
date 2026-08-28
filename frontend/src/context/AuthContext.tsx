import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as api from "../api/client";
import type { CurrentUser } from "../api/client";

interface AuthContextValue {
  user: CurrentUser | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Tokens are held only in React state, never localStorage/sessionStorage --
// a page reload requires signing in again, but nothing readable by an
// injected script (XSS) survives across page loads. A production app
// would instead put the refresh token in an httpOnly cookie the browser
// manages; that needs backend cookie support this repo doesn't implement,
// documented as a stated gap in the README rather than a silent one.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const tokens = await api.login(email, password);
      setAccessToken(tokens.accessToken);
      setUser(await api.me(tokens.accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const tokens = await api.register(email, password);
      setAccessToken(tokens.accessToken);
      setUser(await api.me(tokens.accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    if (accessToken) {
      await api.logout(accessToken).catch(() => undefined);
    }
    setAccessToken(null);
    setUser(null);
  }, [accessToken]);

  return <AuthContext.Provider value={{ user, error, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
