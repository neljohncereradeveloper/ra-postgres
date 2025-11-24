import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { electionsApi } from "@/lib/api/election";
import { settingsApi } from "@/lib/api/settings";

interface ElectionOption {
  value: string;
  label: string;
}

interface SetupActiveElectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentElection?: {
    id: number;
    name: string;
  };
  onSuccess: () => void;
}

export function SetupActiveElectionDialog({
  open,
  onOpenChange,
  currentElection,
  onSuccess,
}: SetupActiveElectionDialogProps) {
  const [scheduledElections, setScheduledElections] = React.useState<
    ElectionOption[]
  >([]);
  const [fetchingElections, setFetchingElections] = React.useState(false);
  const [fetchElectionsError, setFetchElectionsError] = React.useState<
    string | null
  >(null);
  const [selectedElectionId, setSelectedElectionId] = React.useState<
    string | undefined
  >(undefined);
  const [settingActive, setSettingActive] = React.useState(false);
  const [setActiveError, setSetActiveError] = React.useState<string | null>(
    null
  );

  // Fetch scheduled elections and include current active election if not present
  const fetchScheduledElections = React.useCallback(async () => {
    setFetchingElections(true);
    setFetchElectionsError(null);
    try {
      const scheduled = await electionsApi.getScheduledElections();
      let elections: ElectionOption[] = Array.isArray(scheduled)
        ? scheduled
        : [scheduled];
      if (
        currentElection &&
        !elections.some((e) => e.value === String(currentElection.id))
      ) {
        elections = [
          {
            value: String(currentElection.id),
            label: `${currentElection.name} (Active)`,
          },
          ...elections,
        ];
      }
      setScheduledElections(elections);
      setSelectedElectionId(
        currentElection ? String(currentElection.id) : elections[0]?.value
      );
    } catch (err) {
      console.error("Failed to fetch scheduled elections", err);
      setFetchElectionsError("Failed to fetch scheduled elections");
    } finally {
      setFetchingElections(false);
    }
  }, [currentElection]);

  React.useEffect(() => {
    if (open) {
      fetchScheduledElections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // PATCH /api/settings to set active event
  const handleSetActiveElection = async () => {
    if (!selectedElectionId) return;
    setSettingActive(true);
    setSetActiveError(null);
    try {
      // await fetch("/api/settings", {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ eventId: Number(selectedEventId) }),
      // });

      await settingsApi.setActiveElection(selectedElectionId);
      toast.success(`Active election updated successfully`);
      onSuccess();
    } catch (err) {
      console.error("Failed to set active election", err);
      setSetActiveError("Failed to set active election");
    } finally {
      setSettingActive(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup Active Event</DialogTitle>
        </DialogHeader>
        {fetchingElections ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading elections...
          </div>
        ) : fetchElectionsError ? (
          <div className="text-destructive text-sm">{fetchElectionsError}</div>
        ) : (
          <Select
            value={selectedElectionId}
            onValueChange={setSelectedElectionId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select election..." />
            </SelectTrigger>
            <SelectContent>
              {scheduledElections.map((el) => (
                <SelectItem key={el.value} value={el.value}>
                  {el.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {setActiveError && (
          <div className="text-destructive text-sm mt-2">{setActiveError}</div>
        )}
        <DialogFooter>
          <Button
            onClick={handleSetActiveElection}
            disabled={settingActive || !selectedElectionId}
          >
            {settingActive ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Set Active Election
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
