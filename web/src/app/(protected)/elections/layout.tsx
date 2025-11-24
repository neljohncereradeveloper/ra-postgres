import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface ElectionsLayoutProps {
  children: ReactNode;
}

export default function ElectionsLayout({ children }: ElectionsLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
