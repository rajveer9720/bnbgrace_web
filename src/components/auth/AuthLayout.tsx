import type { ReactNode } from "react";
import "../../pages/LoginPage.css";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  switchPrompt: ReactNode;
  footnote: string;
}

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  switchPrompt,
  footnote,
}: AuthLayoutProps) {
  return (
    <main className="login-page">
      <section className="login-card">
        <a className="login-brand" href="/login">
          <span aria-hidden="true">&#10022;</span> bnbgrace <small>AI</small>
        </a>
        <div className="login-heading">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
        {children}
        <p className="login-switch">{switchPrompt}</p>
        <p className="login-footnote">{footnote}</p>
      </section>
    </main>
  );
}
