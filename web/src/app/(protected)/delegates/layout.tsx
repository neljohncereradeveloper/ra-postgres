import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface DelegatesLayoutProps {
  children: ReactNode;
}

export default function DelegatesLayout({ children }: DelegatesLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
