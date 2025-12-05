import { ActiveElection } from '@domain/models/active-election.model';

export interface ActiveElectionRepository<Context = unknown> {
  setActiveElection(electionId: number, context?: Context): Promise<boolean>;
  reset(context?: Context): Promise<boolean>;
  retrieveActiveElection(context?: Context): Promise<ActiveElection | null>;
  findById(id: number, context?: Context): Promise<ActiveElection | null>;
}
