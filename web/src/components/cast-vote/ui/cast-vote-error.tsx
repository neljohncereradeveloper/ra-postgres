import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Error State Component
export function CastVoteError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card className="rounded-lg shadow-md max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-6 w-6" />
          <AlertDescription className="text-lg ml-2">{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button size="lg" onClick={onRetry} className="text-lg px-8">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
