import { ReactNode } from "react";
import CastVoteAccessLayout from "../layouts/cast-vote-access-layout";

interface ReprintLayoutProps {
  children: ReactNode;
}

export default function ReprintLayout({ children }: ReprintLayoutProps) {
  return <CastVoteAccessLayout>{children}</CastVoteAccessLayout>;
}
