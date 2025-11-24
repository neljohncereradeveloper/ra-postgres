"use server";

import { deleteCookie, getCookie } from "cookies-next/server";
import { TOKEN_NAME } from "../constants/auth.constants";
import { cookies } from "next/headers";

/**
 * Clear the authentication token cookie
 * This function should only be used in server actions or API routes
 */
export async function clearAuthCookie() {
  await deleteCookie(TOKEN_NAME, { cookies });
}

export async function getToken(): Promise<string | null> {
  const token = await getCookie(TOKEN_NAME, { cookies });
  return token ? (token as string) : null;
}
