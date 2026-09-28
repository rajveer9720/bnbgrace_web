import type { UserRole } from '../auth/authContext';

export function getTokenRole(token: string): UserRole | null {
  try {
    const encoded = token.split(".")[1];
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")),
    ) as { role?: string };
    return payload.role === "admin" || payload.role === "agent"
      ? payload.role
      : null;
  } catch {
    return null;
  }
}

