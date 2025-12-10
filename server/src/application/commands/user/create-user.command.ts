export interface CreateUserCommand {
  watcher: string;
  precinct: string;
  application_access: string[];
  user_roles: string[];
  user_name: string;
  password: string;
}
