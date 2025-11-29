export interface UpdateElectionCommand {
  name: string;
  desc1: string;
  address: string;
  date: Date;
  maxAttendees: number;
  startTime: Date | null;
  endTime: Date | null;
}
