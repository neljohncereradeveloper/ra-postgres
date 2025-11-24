import { ReactNode } from "react";
import CastVoteAccessLayout from "../layouts/cast-vote-access-layout";

interface CastVoteLayoutProps {
  children: ReactNode;
}

export default function CastVoteLayout({ children }: CastVoteLayoutProps) {
  return <CastVoteAccessLayout>{children}</CastVoteAccessLayout>;
}
