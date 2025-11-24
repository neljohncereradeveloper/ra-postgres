import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Loading State Component
export function CastVoteLoading() {
  return (
    <Card className="rounded-lg shadow-md max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl">Loading candidates...</p>
        </div>
      </CardContent>
    </Card>
  );
}
