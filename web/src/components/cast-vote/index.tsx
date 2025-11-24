"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { castVotesApi } from "@/lib/api/cast-votes";
import { CastVoteCandidates, BallotProps } from "@/types/cast-vote.types";
import { Delegate } from "@/types/delegates.types";
import { CastVoteLoading, CastVoteError } from "./ui";
import { VoteConfirmation, CastVoteForm } from "./vote-casting";
import { DelegateVerification } from "./delegate-validation";
import { Ballot } from "./ballot";

// Define a type for our form values
export interface VoteFormValues {
  [key: string]: number[]; // Each position name maps to an array of candidate IDs
}

// Main Component
export function CastVoteOrchestrator() {
  // Renamed component
  const [castVoteCandidates, setCastVoteCandidates] = React.useState<
    CastVoteCandidates[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [delegate, setDelegate] = React.useState<Delegate | null>(null);
  const [delegateVerified, setDelegateVerified] = React.useState(false);
  const [ballotData, setBallotData] = React.useState<null | BallotProps>(null);
  const [showBallot, setShowBallot] = React.useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VoteFormValues>({
    defaultValues: {},
    shouldUnregister: false, // Prevent fields from being unregistered when components unmount
  });

  const formValues = watch();

  const fetchCastVoteCandidates = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await castVotesApi.getCastVoteCandidates();
      setCastVoteCandidates(Array.isArray(response) ? response : [response]);
    } catch (error) {
      setError("Failed to load candidates. Please try again.");
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Only fetch candidates after delegate verification
    if (delegateVerified) {
      fetchCastVoteCandidates();
    } else {
      setLoading(false);
    }
  }, [fetchCastVoteCandidates, delegateVerified]);

  // Add this function to explicitly clear selections for the current position when none are made
  const handlePositionChange = React.useCallback(
    (positionName: string, selectedIds: number[]) => {
      // Only update if there's a real selection or explicitly clearing (empty array)
      setValue(positionName, selectedIds);
    },
    [setValue]
  );

  const resetAll = () => {
    reset();
    setDelegate(null);
    setDelegateVerified(false);
    setCastVoteCandidates([]);
  };

  const onSubmit = async (data: VoteFormValues) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setSubmitting(true);
    try {
      // Add delay before submitting (e.g., 2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const candidateIds = castVoteCandidates.flatMap((group) =>
        Array.isArray(data[group.position]) ? data[group.position] : []
      );
      const submissionData = {
        controlNumber: delegate?.controlNumber,
        candidates: candidateIds.map((id) => ({ id })),
      };
      const castVote = await castVotesApi.castVote(submissionData);
      toast.success("Your vote has been submitted successfully!");
      // Prepare ballot data for printout
      setBallotData({
        selections: data,
        candidates: castVoteCandidates,
        castVote,
      });
      setShowBallot(true);
      setShowConfirmation(false);
      setSubmitting(false);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to submit your vote. Please try again."
      );
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleBallotDone = () => {
    setShowBallot(false);
    setBallotData(null);
    setSubmitting(false);
    setShowConfirmation(false);
    resetAll();
  };

  const handleDelegateVerified = (verifiedDelegate: Delegate) => {
    setDelegate(verifiedDelegate);
    setDelegateVerified(true);
    setLoading(true); // Show loading while fetching candidates
  };

  // If delegate verification is needed
  if (!delegateVerified) {
    return <DelegateVerification onVerified={handleDelegateVerified} />;
  }

  if (loading) {
    return <CastVoteLoading />;
  }

  if (error) {
    return <CastVoteError error={error} onRetry={fetchCastVoteCandidates} />;
  }

  if (showConfirmation) {
    return (
      <VoteConfirmation
        castVoteCandidates={castVoteCandidates}
        getPositionValues={(position) =>
          Array.isArray(formValues[position]) ? formValues[position] : []
        }
        onBack={() => setShowConfirmation(false)}
        onConfirm={handleSubmit(onSubmit)}
        submitting={submitting}
      />
    );
  }

  if (showBallot && ballotData) {
    return (
      <Ballot
        selections={ballotData.selections}
        candidates={ballotData.candidates}
        castVote={ballotData.castVote}
        onExit={handleBallotDone}
      />
    );
  }

  return (
    <CastVoteForm
      castVoteCandidates={castVoteCandidates}
      control={control}
      errors={errors}
      getPositionValues={(position) =>
        Array.isArray(formValues[position]) ? formValues[position] : []
      }
      onSubmit={handleSubmit(onSubmit)}
      onPositionChange={handlePositionChange}
    />
  );
}
