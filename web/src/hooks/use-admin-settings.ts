import * as React from "react";
import { toast } from "sonner";
import { settingsApi } from "@/lib/api/settings";
import { electionsApi } from "@/lib/api/election";
import type { Settings, ConfirmDialogState } from "@/types/settings.types";

export function useAdminSettings() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] =
    React.useState<ConfirmDialogState>(null);

  // Fetch settings data
  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch settings";

      setError(
        errorMessage === "Failed to fetch settings: Bad Request"
          ? "No active election found."
          : errorMessage
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load settings on component mount
  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // --- Action Handlers (Placeholders) ---
  const performStartElection = async () => {
    try {
      await electionsApi.startElection();
      toast.success("Election started successfully!");
      fetchSettings(); // Refresh settings data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start election";
      toast.error(errorMessage);
    }
  };

  const performEndElection = async () => {
    try {
      await electionsApi.closeElection();
      toast.success("Election ended successfully!");
      fetchSettings(); // Refresh settings data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to end election";
      toast.error(errorMessage);
    }
  };

  const performResetElection = async () => {
    try {
      await settingsApi.resetElection();
      toast.success("Election reset successfully!");
      fetchSettings(); // Refresh settings data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset election";
      toast.error(errorMessage);
    }
  };

  const performCancelElection = async () => {
    try {
      await electionsApi.cancelElection();
      toast.success("Election cancelled successfully!");
      fetchSettings(); // Refresh settings data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel election";
      toast.error(errorMessage);
    }
  };
  // -------------------------------------

  const openConfirmationDialog = (
    type: "start" | "end" | "cancel" | "reset",
    title: string,
    description: string,
    actionLabel: string,
    handler: () => void,
    actionVariant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | null
      | undefined
  ) => {
    setConfirmAction({
      type,
      title,
      description,
      actionLabel,
      handler,
      actionVariant,
    });
    setIsConfirmDialogOpen(true);
  };

  return {
    loading,
    error,
    settings,
    isConfirmDialogOpen,
    confirmAction,
    fetchSettings, // Expose fetchSettings for manual refresh
    setIsConfirmDialogOpen, // Needed for the dialog component
    openConfirmationDialog, // To trigger dialog from buttons
    // Expose specific action handlers if needed directly, or rely on openConfirmationDialog
    performStartElection,
    performEndElection,
    performCancelElection,
    performResetElection,
  };
}
