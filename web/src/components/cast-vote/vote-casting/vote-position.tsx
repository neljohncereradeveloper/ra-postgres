"use client";
import { Controller, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import type { CastVoteCandidates } from "@/types/cast-vote.types";
import { CandidateCard } from "./candidate-card";
import type { VoteFormValues } from "../index";
import { AlertTriangle } from "lucide-react";

export interface VotePositionProps {
  position: CastVoteCandidates;
  control: any;
  errors: any;
  getPositionValues: (position: string) => number[];
  onPositionChange?: (positionName: string, selectedIds: number[]) => void;
}

export function VotePosition({
  position,
  control,
  errors,
  getPositionValues,
  onPositionChange,
}: VotePositionProps) {
  const selectedCount = getPositionValues(position.position).length;
  const maxCandidates = position.positionMaxCandidates || 1;

  return (
    <div className="mb-8 border-2 border-gray-300 rounded-lg bg-white">
      <div className="bg-green-50 text-green-800 p-4">
        <h2 className="text-xl font-bold">{position.position}</h2>
        <p className="text-green-700">
          Select {maxCandidates > 1 ? `up to ${maxCandidates}` : "1"} candidate
          {maxCandidates > 1 ? "s" : ""}
        </p>
      </div>

      <div className="p-4">
        <Controller
          name={position.position as FieldPath<VoteFormValues>}
          control={control}
          defaultValue={[]}
          rules={{
            validate: {
              validSelection: () => true,
            },
          }}
          render={({ field }) => (
            <div className="space-y-4">
              {position.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.candidateId}
                  candidate={candidate}
                  isChecked={getPositionValues(position.position).includes(
                    candidate.candidateId
                  )}
                  onChange={(checked) => {
                    const currentValue = getPositionValues(position.position);
                    let newValue: number[] = [];

                    if (checked) {
                      if (currentValue.length < maxCandidates) {
                        newValue = [...currentValue, candidate.candidateId];
                        field.onChange(newValue);
                      } else {
                        toast.warning(
                          `You can only select ${
                            maxCandidates > 1 ? `up to ${maxCandidates}` : "one"
                          } candidate${maxCandidates > 1 ? "s" : ""}`,
                          {
                            duration: 4000,
                          }
                        );
                        return;
                      }
                    } else {
                      newValue = currentValue.filter(
                        (id: number) => id !== candidate.candidateId
                      );
                      field.onChange(newValue);
                    }

                    // Notify parent component about the change
                    if (onPositionChange) {
                      onPositionChange(position.position, newValue);
                    }
                  }}
                />
              ))}

              {errors[position.position as keyof typeof errors] && (
                <div className="mt-4 p-3 bg-red-50 text-red-900 rounded-lg border border-red-200">
                  <p className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    {
                      errors[position.position as keyof typeof errors]
                        ?.message as string
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {selectedCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-800">
            Selected: {selectedCount} of {maxCandidates}
          </p>
        </div>
      )}
    </div>
  );
}
