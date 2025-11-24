import { ReactNode } from "react";
import ElectionAccessLayout from "../layouts/election-access-layout";

interface DistrictsLayoutProps {
  children: ReactNode;
}

export default function DistrictsLayout({ children }: DistrictsLayoutProps) {
  return <ElectionAccessLayout>{children}</ElectionAccessLayout>;
}
