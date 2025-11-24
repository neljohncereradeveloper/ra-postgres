import { ReactNode } from "react";
import AdminAccessLayout from "../layouts/admin-access-layout";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return <AdminAccessLayout>{children}</AdminAccessLayout>;
}
