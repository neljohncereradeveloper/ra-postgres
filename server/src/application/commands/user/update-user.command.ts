export interface UpdateUserCommand {
  watcher: string;
  precinct: string;
  applicationAccess: string[];
  userRoles: string[];
}
