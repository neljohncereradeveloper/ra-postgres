export interface UpdateElectionCommand {
  name: string;
  desc1: string;
  address: string;
  date: Date;
  max_attendees: number;
  start_time: Date | null;
  end_time: Date | null;
}
