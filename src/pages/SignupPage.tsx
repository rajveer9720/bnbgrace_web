import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/authContext";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

export default function SignupPage() {
  const { registerAgent } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await registerAgent(email.trim().toLowerCase(), password);
      window.location.replace("/agent");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="AGENT SIGNUP"
      title="Create your agent account"
      description="Join the workspace and start helping guests."
      switchPrompt={<>Already have an account? <a href="/login">Sign in</a></>}
      footnote="New accounts are created with agent access.">
      <form onSubmit={submit} aria-busy={isLoading}>
        <AuthField label="Email address"
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="agent@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
        <AuthField label="Password"
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          minLength={8}
          required
        />
        <AuthField label="Confirm password"
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Enter password again"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isLoading}
          minLength={8}
          required
        />
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={
            isLoading || !email.trim() || !password || !confirmPassword
          }
        >
          {isLoading ? "Creating account…" : "Create agent account"}
        </button>
      </form>
    </AuthLayout>
  );
}
