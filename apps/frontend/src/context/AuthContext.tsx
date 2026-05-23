import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { buildApiUrl } from "../lib/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(buildApiUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...((opts?.headers) ?? {}) },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const u = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
    setUser(u);
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
