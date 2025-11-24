import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface PrecinctsLayoutProps {
  children: ReactNode;
}

export default function PrecinctsLayout({ children }: PrecinctsLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
