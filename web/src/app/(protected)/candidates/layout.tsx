import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface CandidatesLayoutProps {
  children: ReactNode;
}

export default function CandidatesLayout({ children }: CandidatesLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
