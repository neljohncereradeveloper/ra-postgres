"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatISOTime } from "@/lib/utils/time-format";
import { formatPeso } from "@/lib/utils/peso-format";
import {
  getStatusBadgeClasses,
  removeDecimal,
} from "@/lib/utils/settings-helpers";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { SetupActiveElectionDialog } from "./setup-active-electionn-dialog";
import { UploadDialog } from "./upload-dialog";
import type { Settings } from "@/types/settings.types";

export function AdminSettings() {
  const {
    loading,
    error,
    settings: rawSettings,
    isConfirmDialogOpen,
    confirmAction,
    fetchSettings,
    setIsConfirmDialogOpen,
    openConfirmationDialog,
    performStartElection,
    performEndElection,
    performCancelElection,
    performResetElection,
  } = useAdminSettings();
  const settings = rawSettings as Settings | null;

  // Dialog state for Setup Active Event
  const [isSetupDialogOpen, setIsSetupDialogOpen] = React.useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);

  if (loading && !settings) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes("No active election")) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setIsSetupDialogOpen(true)}>
            Setup Active Election
          </Button>
        </div>
        <SetupActiveElectionDialog
          open={isSetupDialogOpen}
          onOpenChange={setIsSetupDialogOpen}
          currentElection={
            settings ? (settings as Settings).election : undefined
          }
          onSuccess={() => {
            setIsSetupDialogOpen(false);
            fetchSettings();
          }}
        />
      </div>
    );
  }

  // Added check: If not loading, no error, but still no settings, show setup prompt
  if (!loading && !error && !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system settings.</p>
        </div>
        <Separator />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Initial Setup Required</CardTitle>
            <CardDescription>
              No active system settings found. Please configure the settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsSetupDialogOpen(true)}>
              Setup Active Settings
            </Button>
          </CardContent>
        </Card>
        <SetupActiveElectionDialog
          open={isSetupDialogOpen}
          onOpenChange={setIsSetupDialogOpen}
          currentElection={undefined}
          onSuccess={() => {
            setIsSetupDialogOpen(false);
            fetchSettings();
          }}
        />
      </div>
    );
  }

  // If settings exists but settings.event is null/undefined, show setup prompt
  if (!loading && !error && settings && !settings.election) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system settings.</p>
        </div>
        <Separator />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Active Event</CardTitle>
            <CardDescription>
              There is currently no active election. Please set up an active
              election to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsSetupDialogOpen(true)}>
              Setup Active Election
            </Button>
          </CardContent>
        </Card>
        <SetupActiveElectionDialog
          open={isSetupDialogOpen}
          onOpenChange={setIsSetupDialogOpen}
          currentElection={undefined}
          onSuccess={() => {
            setIsSetupDialogOpen(false);
            fetchSettings();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>System Settings Overview</CardTitle>
          <CardDescription>
            View current system configuration and active event details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {settings?.election && (
            <>
              <div>
                <span className="text-muted-foreground">Election Name:</span>{" "}
                {settings.election.name}
              </div>
              <div>
                <span className="text-muted-foreground">Election Status:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                    settings.election.status
                  )}`}
                >
                  {settings.election.status}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Start Time:</span>{" "}
                {formatISOTime(settings.election.startTime) ?? "Not set"}
              </div>
              <div>
                <span className="text-muted-foreground">End Time:</span>{" "}
                {formatISOTime(settings.election.endTime) ?? "Not set"}
              </div>

              <div>
                <span className="text-muted-foreground">Max Attendees:</span>{" "}
                {settings.election.maxAttendees}
              </div>

              <div>
                <span className="text-muted-foreground">Election Date:</span>{" "}
                {settings.election.date}
              </div>
              <div>
                <span className="text-muted-foreground">
                  Election Location:
                </span>{" "}
                {settings.election.address}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                openConfirmationDialog(
                  "start",
                  "Start Election?",
                  "Are you sure you want to start the currently selected election?",
                  "Start Election",
                  performStartElection
                )
              }
              disabled={
                settings?.election?.status === "started" ||
                settings?.election?.status === "ended"
              }
              size="sm"
            >
              Start Election
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                openConfirmationDialog(
                  "end",
                  "End Election?",
                  "Are you sure you want to end the currently selected election? This action might be irreversible.",
                  "End Election",
                  performEndElection,
                  "destructive" // Pass variant hint for action button
                )
              }
              disabled={settings?.election?.status === "ended"}
              size="sm"
            >
              End Election
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                openConfirmationDialog(
                  "cancel",
                  "Cancel Election?",
                  "Are you sure you want to cancel the currently selected election? This may affect registrations.",
                  "Confirm",
                  performCancelElection,
                  "destructive" // Pass variant hint for action button
                )
              }
              disabled={settings?.election?.status === "ended"}
              size="sm"
            >
              Cancel Election
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                openConfirmationDialog(
                  "reset",
                  "Reset Election?",
                  "Are you sure you want to reset the currently selected election? This action might be irreversible.",
                  "Reset Election",
                  performResetElection,
                  "destructive" // Pass variant hint for action button
                )
              }
              disabled={settings?.election?.status === "started"}
              size="sm"
            >
              Reset Election
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
              disabled={
                settings?.election?.status === "started" ||
                settings?.election?.status === "ended"
              }
            >
              Upload Attendees
            </Button>
          </div>
          <Button onClick={fetchSettings} size="sm" variant="outline">
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmAction?.handler();
                setIsConfirmDialogOpen(false); // Close dialog after action
              }}
              className={buttonVariants({
                variant: confirmAction?.actionVariant || "default",
              })}
            >
              {confirmAction?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </>
  );
}
