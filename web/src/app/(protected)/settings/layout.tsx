import { ReactNode } from "react";
import AdminAccessLayout from "../layouts/admin-access-layout";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <AdminAccessLayout>{children}</AdminAccessLayout>;
}
