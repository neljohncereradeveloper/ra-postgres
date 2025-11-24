"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CandidateViewDialogProps } from "@/types/candidates.types";

export function CandidateViewDialog({
  candidate,
  isOpen,
  onClose,
}: CandidateViewDialogProps) {
  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            View Candidate
            <div className="text-sm text-gray-500">Candidate data</div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm font-medium">Election :</div>
            <div>{candidate.election}</div>
          </div>
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm font-medium">Candidate Name :</div>
            <div>{candidate.displayName}</div>
          </div>

          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm font-medium">District :</div>
            <div>{candidate.district}</div>
          </div>
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm  font-medium">Position :</div>
            <div>{candidate.position}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
