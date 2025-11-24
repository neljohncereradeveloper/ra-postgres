"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PositionViewDialogProps } from "@/types/position.types";

export function PositionViewDialog({
  position,
  isOpen,
  onClose,
}: PositionViewDialogProps) {
  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            View Position
            <div className="text-sm text-gray-500">Position data</div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm font-medium">Description :</div>
            <div>{position.desc1}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Max Candidates :</div>
            <div>{position.maxCandidates}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Term Limit :</div>
            <div>{position.termLimit}</div>
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
