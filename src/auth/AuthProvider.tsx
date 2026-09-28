import { useSelector } from 'react-redux';
import type { RootState } from '../stores';
import { setUser, setAuthLoading } from '../stores/slices/authSlice';
import { store } from '../stores';
import { api } from '../stores/apis/baseApi';
import { useEffect } from "react";
import type { ReactNode } from "react";
import { authenticate, verifyToken } from "./authService";
import { getTokenRole } from '../utils/token.util';
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("accessToken");
    const role = token ? getTokenRole(token) : null;
    if (!token || !role) {
      localStorage.removeItem("accessToken");
      queueMicrotask(() => {
        if (active) store.dispatch(setAuthLoading(false));
      });
      return () => {
        active = false;
      };
    }
    void verifyToken(token, role)
      .then((verifiedUser) => {
        if (active) store.dispatch(setUser(verifiedUser));
      })
      .catch(() => {
        if (active) localStorage.removeItem("accessToken");
      })
      .finally(() => {
        if (active) store.dispatch(setAuthLoading(false));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function clearExpiredSession() {
      localStorage.removeItem("accessToken");
      store.dispatch(api.util.resetApiState());
      store.dispatch(setUser(null));
      window.history.replaceState({}, "", "/login");
    }
    window.addEventListener("auth:unauthorized", clearExpiredSession);
    return () =>
      window.removeEventListener("auth:unauthorized", clearExpiredSession);
  }, []);

  async function login(email: string, password: string) {
    const verifiedUser = await authenticate("/auth/login", email, password);
    store.dispatch(setUser(verifiedUser));
    return verifiedUser;
  }

  async function registerAgent(email: string, password: string) {
    const verifiedUser = await authenticate("/auth/register", email, password);
    store.dispatch(setUser(verifiedUser));
    return verifiedUser;
  }

  function logout() {
    localStorage.removeItem("accessToken");
    store.dispatch(api.util.resetApiState());
    store.dispatch(setUser(null));
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
