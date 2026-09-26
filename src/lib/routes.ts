import type { UserRole } from "../auth/authContext";

export function getWorkspacePath(role: UserRole) {
  return role === "admin" ? "/admin/knowledge" : "/agent";
}
