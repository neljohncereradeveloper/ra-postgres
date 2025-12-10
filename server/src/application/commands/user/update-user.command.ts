export interface UpdateUserCommand {
  watcher: string;
  precinct: string;
  application_access: string[];
  user_roles: string[];
}
