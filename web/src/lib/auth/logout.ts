"use client";

import { useRouter } from "next/navigation";
import { apiLogout } from "./api";
import { handleApiError } from "../utils/handle-api-error";

/**
 * Logout function for client components
 */
export function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await apiLogout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      handleApiError(
        error,
        error instanceof Error ? error.message : "Failed to logout"
      );
      // Important: Handle logout API failure by clearing cookie manually
      // Even if the API fails, clear the cookie and redirect
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
      router.refresh();
    }
  };
}

/**
 * Alternative logout function for components that don't use hooks
 */
export async function performLogout(): Promise<void> {
  try {
    await apiLogout();
    window.location.href = "/login";
    console.log("Logged out");
  } catch (error) {
    handleApiError(
      error,
      error instanceof Error ? error.message : "Failed to logout"
    );
    // Important: Handle logout API failure by clearing cookie manually
    // Even if the API fails, clear the cookie and redirect
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }
}
