"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CandidatesReport from "./candidates";
import CastVoteReport from "./cast-votes";

export function ReportsManagement() {
  return (
    <Card className="rounded-none">
      <CardHeader className="print:hidden">
        <CardTitle>Election Reports</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Generate election reports.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cast-vote" className="w-full">
          <TabsList className="mb-4 print:hidden">
            <TabsTrigger value="cast-vote">Cast Vote Report</TabsTrigger>
            <TabsTrigger value="candidates">Candidates Report</TabsTrigger>
          </TabsList>
          <TabsContent value="cast-vote">
            <CastVoteReport />
          </TabsContent>
          <TabsContent value="candidates">
            <CandidatesReport />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
