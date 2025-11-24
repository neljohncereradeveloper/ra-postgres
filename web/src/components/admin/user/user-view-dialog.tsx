"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Building,
  Briefcase,
  Tag,
  Terminal,
  UserCog,
} from "lucide-react";
import { User } from "@/lib/api/users";

interface UserViewDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserViewDialog({ user, isOpen, onClose }: UserViewDialogProps) {
  if (!user) return null;

  // Convert comma-separated application access to array
  const applicationAccessList = user.applicationAccess?.split(",") || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {user.watcher}
            <div className="text-sm text-gray-500">{user.precinct}</div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">Username:</div>
            <div>{user.userName}</div>
          </div>

          <div className="flex items-start gap-3">
            <Terminal className="h-5 w-5 text-gray-500 mt-1.5" />
            <div className="text-sm font-medium mt-1">Application Access:</div>
            <div className="flex flex-wrap gap-2">
              {applicationAccessList.length > 0 ? (
                applicationAccessList.map((access, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700"
                  >
                    {access.trim()}
                  </span>
                ))
              ) : (
                <span>No access specified</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserCog className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm font-medium">User Role:</div>
            <div>
              <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700">
                {user.userRoles}
              </span>
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
