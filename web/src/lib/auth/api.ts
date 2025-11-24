// Utility functions for interacting with the auth API routes

import { fetchInternal } from "@/lib/api/internal";
import type { LoginCredentials, UserSession } from "./types";

/**
 * Call the login API route
 */
export async function apiLogin(
  credentials: LoginCredentials
): Promise<{ user: UserSession }> {
  // Calling internal login API route

  return fetchInternal<{ user: UserSession }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Call the logout API route
 */
export async function apiLogout(): Promise<{ success: boolean }> {
  return fetchInternal<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}

/**
 * Check the current session status
 */
export async function apiCheckSession(): Promise<{
  authenticated: boolean;
  user?: UserSession;
}> {
  return fetchInternal<{
    authenticated: boolean;
    user?: UserSession;
  }>("/auth/session");
}
