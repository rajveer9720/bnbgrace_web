import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authenticate, getTokenRole, verifyToken } from "./authService";
import { AuthContext } from "./authContext";
import type { AuthUser } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("accessToken");
    const role = token ? getTokenRole(token) : null;
    if (!token || !role) {
      localStorage.removeItem("accessToken");
      queueMicrotask(() => {
        if (active) setIsLoading(false);
      });
      return () => {
        active = false;
      };
    }
    void verifyToken(token, role)
      .then((verifiedUser) => {
        if (active) setUser(verifiedUser);
      })
      .catch(() => {
        if (active) localStorage.removeItem("accessToken");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function clearExpiredSession() {
      localStorage.removeItem("accessToken");
      setUser(null);
      window.history.replaceState({}, "", "/login");
    }
    window.addEventListener("auth:unauthorized", clearExpiredSession);
    return () =>
      window.removeEventListener("auth:unauthorized", clearExpiredSession);
  }, []);

  async function login(email: string, password: string) {
    const verifiedUser = await authenticate("/auth/login", email, password);
    setUser(verifiedUser);
    return verifiedUser;
  }

  async function registerAgent(email: string, password: string) {
    const verifiedUser = await authenticate("/auth/register", email, password);
    setUser(verifiedUser);
    return verifiedUser;
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.history.replaceState({}, "", "/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, registerAgent, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
