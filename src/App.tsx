import { useEffect, useSyncExternalStore } from "react";
import { getWorkspacePath } from "./lib/routes";
import KnowledgePage from "./pages/KnowledgePage";
import AgentPage from "./pages/AgentPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./auth/authContext";
import "./App.css";

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getPathname() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

export default function App() {
  const { user, isLoading } = useAuth();
  const path = useSyncExternalStore(subscribeToNavigation, getPathname);
  const shouldRedirect = Boolean(user) && (path === "/" || path === "/login");

  useEffect(() => {
    if (user && shouldRedirect) {
      window.history.replaceState({}, "", getWorkspacePath(user.role));
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [user, shouldRedirect]);

  if (isLoading)
    return (
      <main className="auth-loading" role="status">
        <span />
        Checking your session…
      </main>
    );
  if (!user) return path === "/signup" ? <SignupPage /> : <LoginPage />;
  if (path === "/" || path === "/login") {
    return user.role === "admin" ? <KnowledgePage /> : <AgentPage key={user.id} />;
  }
  if (path === "/agent" && (user.role === "agent" || user.role === "admin"))
    return <AgentPage key={user.id} />;
  if (path === "/admin/knowledge" && user.role === "admin")
    return <KnowledgePage />;
  return (
    <main className="app-shell forbidden-page">
      <p className="eyebrow">ACCESS RESTRICTED</p>
      <h1>You cannot open this page</h1>
      <p>This route is not available for your {user.role} account.</p>
      <a href={getWorkspacePath(user.role)}>
        Go to your workspace
      </a>
    </main>
  );
}
