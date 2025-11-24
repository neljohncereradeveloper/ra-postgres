"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { DelegateSearch } from "./delegate-search";

export function CDelegates() {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Delegates</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage delegates.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DelegateSearch />
      </CardContent>
    </Card>
  );
}
