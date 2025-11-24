"use client";

// Client-side auth utilities that don't rely on next/headers
import type { UserSession } from "./types";
import { apiCheckSession } from "./api";

/**
 * Get the current session on the client side
 */
export async function getClientSession(): Promise<UserSession | null> {
  try {
    const response = await apiCheckSession();
    if (response.authenticated && response.user) {
      return response.user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if the user has access to a specific module
 */
export async function hasModuleAccess(moduleName: string): Promise<boolean> {
  const session = await getClientSession();

  if (!session) {
    return false;
  }

  return session.applicationAccess.includes(moduleName);
}
