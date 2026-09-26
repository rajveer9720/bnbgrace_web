import { getWorkspacePath } from "../lib/routes";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/authContext";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

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
        getWorkspacePath(user.role),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="WELCOME BACK"
      title="Sign in to your workspace"
      description="Use your admin or agent account to continue."
      switchPrompt={<>New agent? <a href="/signup">Create an account</a></>}
      footnote="Your destination is selected automatically from your account role.">
      <form onSubmit={submit} aria-busy={isLoading}>
        <AuthField label="Email address"
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
        <AuthField label="Password"
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
    </AuthLayout>
  );
}
