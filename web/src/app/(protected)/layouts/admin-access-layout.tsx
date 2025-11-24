"use server";

import { ReactNode } from "react";
import { checkModuleAccess } from "@/lib/auth/permissions";
import { AuthApplicationAccessEnum } from "@/lib/constants/auth.constants";

interface AdminAccessLayoutProps {
  children: ReactNode;
}

export default async function AdminAccessLayout({
  children,
}: AdminAccessLayoutProps) {
  // Verify the user has admin access
  await checkModuleAccess(
    AuthApplicationAccessEnum.AdminModule,
    "/unauthorized" // Redirect to /unauthorized if they don't have access
  );

  return <>{children}</>;
}
