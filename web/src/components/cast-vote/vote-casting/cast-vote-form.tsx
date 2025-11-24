import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CastVoteCandidates } from "@/types/cast-vote.types";
import { VotePosition } from "./vote-position";

export interface CastVoteFormProps {
  castVoteCandidates: CastVoteCandidates[];
  control: any;
  errors: any;
  getPositionValues: (position: string) => number[];
  onSubmit: () => void;
  onPositionChange?: (positionName: string, selectedIds: number[]) => void;
}

// Main Voting Form Component
export function CastVoteForm({
  castVoteCandidates,
  control,
  errors,
  getPositionValues,
  onSubmit,
  onPositionChange,
}: CastVoteFormProps) {
  return (
    <Card className="rounded-lg shadow-md max-w-4xl mx-auto">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-2xl text-green-800">
          Cast Your Vote
        </CardTitle>
        <CardDescription className="text-lg text-green-700 flex justify-between items-center">
          <span>Select your preferred candidates for each position</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="voteForm" onSubmit={onSubmit} className="space-y-6">
          {/* Desktop view - all positions at once */}
          {castVoteCandidates.map((castVoteCandidate) => (
            <VotePosition
              key={castVoteCandidate.position}
              position={castVoteCandidate}
              control={control}
              errors={errors}
              getPositionValues={getPositionValues}
              onPositionChange={onPositionChange}
            />
          ))}
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button
          form="voteForm"
          type="submit"
          size="lg"
          className="ml-auto text-lg px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Review Vote
        </Button>
      </CardFooter>
    </Card>
  );
}
