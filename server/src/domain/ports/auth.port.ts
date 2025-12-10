import { User } from '@domain/models/user.model';

// auth.port.ts
export interface AuthPort {
  validateUser(user_name: string, password: string): Promise<any>;
  login(user: User): {
    token: string;
    payload: {
      name: string;
      sub: number;
      user_roles: string[];
      application_access: string[];
    };
  };
  jwtVerify(token: string): Promise<any>;
}
