"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "./server";
import { AuthApplicationAccessEnum } from "../constants/auth.constants";

/**
 * Redirects users based on their access permissions for a given page (e.g., Dashboard).
 * - Admin users: access granted.
 * - Election management users: access granted.
 * - Cast vote users (only): redirected to /cast-vote if not already there.
 * - Others (authenticated but without these specific permissions): redirected to /unauthorized.
 */
export async function redirectBasedOnAccess(currentPath?: string) {
  const session = await requireAuth(); // Ensures user is logged in, or redirects to /login

  const appAccess = session.applicationAccess;

  // Admin users can access (e.g., the dashboard)
  if (appAccess.includes(AuthApplicationAccessEnum.AdminModule)) {
    return;
  }

  // Election management users can access (e.g., the dashboard)
  if (appAccess.includes(AuthApplicationAccessEnum.ElectionManagementModule)) {
    return;
  }

  // Cast vote users (without Admin or Election Management access)
  if (appAccess.includes(AuthApplicationAccessEnum.CastVoteManagementModule)) {
    // If they only have CastVote, their primary page is /cast-vote
    if (
      currentPath &&
      currentPath !== "/cast-vote" &&
      currentPath !== "/cast-vote/"
    ) {
      redirect("/cast-vote");
    }
    return; // Allow access if they are on /cast-vote or if no currentPath is provided (shouldn't happen from dashboard)
  }

  // If none of the above specific roles that grant access to this context (e.g. dashboard) are present,
  // and it's not the special cast-vote only user flow going to /cast-vote,
  // then the user is unauthorized for this page (e.g., Dashboard).
  // This check is important if currentPath is the dashboard itself.
  if (
    currentPath &&
    (currentPath === "/dashboard" || currentPath === "/dashboard/")
  ) {
    redirect("/unauthorized");
  }
  // If currentPath is something else (e.g. /cast-vote for a cast-vote user), the logic above handles it.
  // If a user with no permissions at all lands here from a generic protected route,
  // and it's not the dashboard, this function might let them through if not for a specific layout guard.
  // However, pages should be wrapped in specific access layouts or call this function directly like DashboardPage.
}

/**
 * Check if user has access to a specific module.
 * Returns the session if they do, redirects if they don't.
 */
export async function checkModuleAccess(
  moduleName: string,
  redirectPath: string = "/unauthorized" // Default to /unauthorized
) {
  const session = await requireAuth(); // Ensures user is logged in, or redirects to /login

  if (!session.applicationAccess.includes(moduleName)) {
    redirect(redirectPath);
  }

  return session;
}

/**
 * Get user permissions flags.
 */
export async function getUserPermissions() {
  const session = await requireAuth();

  return {
    isAdmin: session.applicationAccess.includes(
      AuthApplicationAccessEnum.AdminModule
    ),
    hasElectionAccess: session.applicationAccess.includes(
      AuthApplicationAccessEnum.ElectionManagementModule
    ),
    hasCastVoteAccess: session.applicationAccess.includes(
      AuthApplicationAccessEnum.CastVoteManagementModule
    ),
  };
}
