import { ActiveElection } from '@domain/models/active-election.model';

export interface ActiveElectionRepository<Context = unknown> {
  update(electionId: number, context?: Context): Promise<boolean>;
  resetElection(context?: Context): Promise<boolean>;
  retrieveActiveElection(context?: Context): Promise<ActiveElection | null>;
}
