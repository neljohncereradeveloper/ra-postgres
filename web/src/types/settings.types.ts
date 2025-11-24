export interface Election {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxAttendees: number | null;
  status: string;
}

export interface Settings {
  id: number;
  setupCode: string;
  electionId: number;
  election: Election;
}

// Type for confirmation dialog state
export type ConfirmDialogState = {
  type: "start" | "end" | "cancel" | "reset";
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  handler: () => void;
} | null;
