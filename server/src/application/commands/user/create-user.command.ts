export interface CreateUserCommand {
  watcher: string;
  precinct: string;
  applicationAccess: string[];
  userRoles: string[];
  userName: string;
  password: string;
}
