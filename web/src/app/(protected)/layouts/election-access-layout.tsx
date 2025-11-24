"use server";

import { ReactNode } from "react";
import { checkModuleAccess } from "@/lib/auth/permissions";
import { AuthApplicationAccessEnum } from "@/lib/constants/auth.constants";

interface ElectionAccessLayoutProps {
  children: ReactNode;
}

export default async function ElectionAccessLayout({
  children,
}: ElectionAccessLayoutProps) {
  // Verify the user has election management access
  await checkModuleAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
    "/unauthorized" // Redirect to /unauthorized if they don't have access
  );

  return <>{children}</>;
}
