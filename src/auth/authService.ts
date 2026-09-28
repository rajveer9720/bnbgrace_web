import { authApi } from "../stores/apis/authApi";
import { getApiError } from "../utils/api-error.util";
import { store } from "../stores";
import type { UserRole } from "./authContext";

import { getTokenRole } from "../utils/token.util";

export async function verifyToken(token: string, role: UserRole) {
  const request = store.dispatch(
    authApi.endpoints.verifySession.initiate({ token, role }),
  );
  const data = await request.unwrap().finally(() => request.reset());
  if (!data?.user || data.user.role !== role)
    throw new Error("Invalid user session.");
  return data.user;
}

export async function authenticate(
  endpoint: "/auth/login" | "/auth/register",
  email: string,
  password: string,
) {
  try {
    const action =
      endpoint === "/auth/login"
        ? authApi.endpoints.login
        : authApi.endpoints.register;
    const request = store.dispatch(action.initiate({ email, password }));
    const data = await request.unwrap().finally(() => request.reset());
    if (!data?.accessToken)
      throw new Error("The response did not include an access token.");
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
