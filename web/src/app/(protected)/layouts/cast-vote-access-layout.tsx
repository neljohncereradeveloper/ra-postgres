"use server";

import { ReactNode } from "react";
import { checkModuleAccess } from "@/lib/auth/permissions";
import { AuthApplicationAccessEnum } from "@/lib/constants/auth.constants";

interface CastVoteAccessLayoutProps {
  children: ReactNode;
}

export default async function CastVoteAccessLayout({
  children,
}: CastVoteAccessLayoutProps) {
  // Verify the user has cast vote access
  await checkModuleAccess(
    AuthApplicationAccessEnum.CastVoteManagementModule,
    "/unauthorized" // Redirect to /unauthorized if they don't have access
  );

  return <>{children}</>;
}
