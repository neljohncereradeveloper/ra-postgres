"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "./session";
import { AuthApplicationAccessEnum } from "../constants/auth.constants";
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireModuleAccess(moduleName: string) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.applicationAccess.includes(moduleName)) {
    redirect("/dashboard");
  }
  return session;
}
