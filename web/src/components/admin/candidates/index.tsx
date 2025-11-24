"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { CandidateSearch } from "./candidate-search";
export function CCandidates() {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage candidates.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CandidateSearch />
      </CardContent>
    </Card>
  );
}
