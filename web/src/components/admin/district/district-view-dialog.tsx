"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DistrictViewDialogProps } from "@/types/district.types";

export function DistrictViewDialog({
  district,
  isOpen,
  onClose,
}: DistrictViewDialogProps) {
  if (!district) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            View District
            <div className="text-sm text-gray-500">District data</div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-5 w-5 text-gray-500 mt-0.5" /> */}
            <div className="text-sm font-medium">Description :</div>
            <div>{district.desc1}</div>
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
