import { Checkbox } from "@/components/ui/checkbox";
import type { CastVoteCandidates } from "@/types/cast-vote.types";

// Individual Candidate Component
export interface CandidateCardProps {
  candidate: CastVoteCandidates["candidates"][0];
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export function CandidateCard({
  candidate,
  isChecked,
  onChange,
}: CandidateCardProps) {
  return (
    <div
      className={`border-1 rounded-lg p-5 transition-colors ${
        isChecked
          ? "border-green-500 bg-green-50"
          : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
      }`}
    >
      <label className="flex items-center gap-4 cursor-pointer w-full">
        <Checkbox
          className={`h-6 w-6 border-2 ${
            isChecked ? "border-blue-500" : "border-gray-400"
          }`}
          checked={isChecked}
          onCheckedChange={onChange}
        />
        <span className="text-lg font-medium">{candidate.displayName}</span>
      </label>
    </div>
  );
}
