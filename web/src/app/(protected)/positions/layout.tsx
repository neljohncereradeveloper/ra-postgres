import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface PositionsLayoutProps {
  children: ReactNode;
}

export default function PositionsLayout({ children }: PositionsLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
