"use client";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowLeft, Vote } from "lucide-react";
import type { CastVoteCandidates } from "@/types/cast-vote.types";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

export interface VoteConfirmationProps {
  castVoteCandidates: CastVoteCandidates[];
  getPositionValues: (position: string) => number[];
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

export function VoteConfirmation({
  castVoteCandidates,
  getPositionValues,
  onBack,
  onConfirm,
  submitting,
}: VoteConfirmationProps) {
  // Count total selections
  const totalSelections = castVoteCandidates.reduce((total, position) => {
    return total + getPositionValues(position.position).length;
  }, 0);

  return (
    <Card className="rounded-lg border-2 border-gray-300 shadow-md max-w-4xl mx-auto">
      <CardHeader className="border-b text-green-800 p-6">
        <div className="flex items-center gap-3">
          <Vote className="h-8 w-8" />
          <CardTitle className="text-2xl font-bold">
            Review Your Ballot
          </CardTitle>
        </div>
        <p className="text-green-700 text-lg mt-2">
          You have selected {totalSelections} candidate
          {totalSelections !== 1 ? "s" : ""}. Please review your choices before
          submitting.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {castVoteCandidates.map((castVoteCandidate) => {
          const selectedIds = getPositionValues(castVoteCandidate.position);
          const selectedCandidates = castVoteCandidate.candidates.filter((c) =>
            selectedIds.includes(c.candidateId)
          );

          return (
            <div key={castVoteCandidate.position} className="mb-6">
              <div className="bg-green-50 p-3 rounded-t-lg border-x-2 border-t-2 border-green-200">
                <h2 className="text-xl font-bold text-green-800">
                  {castVoteCandidate.position}
                </h2>
                <p className="text-green-700">
                  {selectedCandidates.length} of{" "}
                  {castVoteCandidate.positionMaxCandidates} selected
                </p>
              </div>

              <div className="bg-white p-5 rounded-b-lg border-2 border-gray-300 border-t-0">
                {selectedCandidates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidates.map((candidate) => (
                      <div
                        key={candidate.candidateId}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-lg font-medium">
                            {candidate.displayName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg">
                    <p className="text-lg">
                      No candidates selected for this position
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-lg text-green-800">
            Please review your selections carefully. Once submitted, your vote
            cannot be changed.
          </p>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="p-6 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="text-lg h-14 px-8 border-2 border-gray-300 w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Go Back & Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="lg"
              disabled={submitting}
              className="text-lg h-14 px-8 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Submit My Vote
                </>
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">
                Confirm Your Vote
              </AlertDialogTitle>
              <Separator className="my-2" />
              <AlertDialogDescription className="text-base text-center py-2">
                Are you sure you want to submit your vote? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
              <AlertDialogCancel className="text-base h-12 border-2">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  onClick={onConfirm}
                  disabled={submitting}
                  className="text-base h-12 bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Yes, Submit My Vote
                    </>
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
