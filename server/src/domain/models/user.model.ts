export class User {
  id: number;
  precinct: string;
  watcher: string;
  applicationAccess: string;
  userRoles: string;
  userName: string;
  password: string;
  deletedAt?: Date | null;
  constructor(params: {
    id?: number;
    precinct: string;
    watcher: string;
    userRoles: string;
    applicationAccess: string;
    userName?: string;
    password?: string;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.precinct = params.precinct;
    this.watcher = params.watcher;
    this.userRoles = params.userRoles;
    this.applicationAccess = params.applicationAccess;
    this.userName = params.userName;
    this.password = params.password;
    this.deletedAt = params.deletedAt;
  }
}
