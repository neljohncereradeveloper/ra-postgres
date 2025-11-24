import { Setting } from '@domain/models/setting.model';

export interface SettingsRepository<Context = unknown> {
  update(electionId: number, context?: Context): Promise<boolean>;
  resetElection(context?: Context): Promise<boolean>;
  retrieveActiveElection(context?: Context): Promise<Setting>;
}
