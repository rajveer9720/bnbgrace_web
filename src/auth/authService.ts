import { api, getApiError } from "../lib/api";
import type { AuthUser, UserRole } from "./authContext";

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

export async function verifyToken(token: string, role: UserRole) {
  const { data } = await api.get<{ user: AuthUser }>(`/auth/${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!data?.user || data.user.role !== role)
    throw new Error("Invalid user session.");
  return data.user;
}

export async function authenticate(endpoint: "/auth/login" | "/auth/register", email: string, password: string) {
  try {
    const { data } = await api.post<{ accessToken: string }>(endpoint, { email, password });
    if (!data?.accessToken) throw new Error("The response did not include an access token.");
    const role = getTokenRole(data.accessToken);
    if (!role) throw new Error("The account does not have a valid role.");
    if (endpoint === "/auth/register" && role !== "agent") {
      throw new Error("New accounts must have the agent role.");
    }
    const user = await verifyToken(data.accessToken, role);
    localStorage.setItem("accessToken", data.accessToken);
    return user;
  } catch (error) {
    throw new Error(getApiError(error));
  }
}
