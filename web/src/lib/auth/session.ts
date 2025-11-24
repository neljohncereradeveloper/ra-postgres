import { redirect } from "next/navigation";
import type { UserSession, JwtPayload } from "./types";
import { jwtDecode } from "jwt-decode";
import { getToken } from "./auth-utils";

export async function getServerSession(
  redirectTo?: string
): Promise<UserSession | null> {
  try {
    const token = await getToken();
    if (!token) {
      if (redirectTo) redirect(redirectTo);
      return null;
    }

    try {
      // Decode the JWT token to get user data
      const decoded = jwtDecode<JwtPayload>(token);
      if (!decoded || typeof decoded !== "object") {
        if (redirectTo) redirect(redirectTo);
        return null;
      }

      // Extract user data from token payload
      return {
        name: decoded.name || "",
        id: decoded.sub || 0,
        userRoles: decoded.userRoles || "",
        applicationAccess: decoded.applicationAccess || "",
      };
    } catch (decodeError) {
      if (redirectTo) redirect(redirectTo);
      return null;
    }
  } catch (error) {
    if (redirectTo) redirect(redirectTo);
    return null;
  }
}
