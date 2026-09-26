import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/authContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const user = await login(email.trim().toLowerCase(), password);
      window.location.replace(
        user.role === "admin" ? "/admin/knowledge" : "/agent",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <a className="login-brand" href="/login">
          <span>✦</span> bnbgrace <small>AI</small>
        </a>
        <div className="login-heading">
          <p>WELCOME BACK</p>
          <h1>Sign in to your workspace</h1>
          <span>Use your admin or agent account to continue.</span>
        </div>
        <form onSubmit={submit} aria-busy={isLoading}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
            required
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            required
          />
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="login-switch">
          New agent? <a href="/signup">Create an account</a>
        </p>
        <p className="login-footnote">
          Your destination is selected automatically from your account role.
        </p>
      </section>
    </main>
  );
}
