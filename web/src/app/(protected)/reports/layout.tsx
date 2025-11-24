import { ReactNode } from "react";
import AdminAccessLayout from "../layouts/admin-access-layout";

interface ReportsLayoutProps {
  children: ReactNode;
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return <AdminAccessLayout>{children}</AdminAccessLayout>;
}
