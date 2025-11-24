"use client";

import { formatDateLong } from "@/lib/utils/date-format";
import { formatISOTime } from "@/lib/utils/time-format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Users, Coins } from "lucide-react";
import { formatPeso } from "@/lib/utils/peso-format";
import { removeDecimal } from "@/lib/utils/settings-helpers";

// Event type definition
export type Election = {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxAttendees: number | null;
  status: string;
};

interface ElectionViewDialogProps {
  election: Election | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ElectionViewDialog({
  election,
  isOpen,
  onClose,
}: ElectionViewDialogProps) {
  if (!election) return null;

  // Get status badge color based on event status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {election.name}
            <div className="text-sm text-gray-500">
              {election.desc1 || "No description available"}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">Date :</div>
            <div>{formatDateLong(election.date)}</div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">Time :</div>
            <div>
              {election.startTime && election.endTime
                ? `${formatISOTime(election.startTime)} - ${formatISOTime(
                    election.endTime
                  )}`
                : "No time specified"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">Location :</div>
            <div>{election.address || "No location specified"}</div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">Max Attendees :</div>
            <div>{election.maxAttendees}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="text-sm font-medium">Status :</div>
            <div
              className={`inline-block mt-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                election.status
              )}`}
            >
              {election.status}
            </div>
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
