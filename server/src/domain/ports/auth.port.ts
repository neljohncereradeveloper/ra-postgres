import { User } from '@domain/models/user.model';

// auth.port.ts
export interface AuthPort {
  validateUser(username: string, password: string): Promise<any>;
  login(user: User): {
    token: string;
    payload: {
      name: string;
      sub: number;
      userRoles: string[];
      applicationAccess: string[];
    };
  };
  jwtVerify(token: string): Promise<any>;
}
