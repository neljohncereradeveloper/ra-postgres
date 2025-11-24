// Common type definitions for auth functionality

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  payload: {
    name: string;
    sub: number;
    userRoles: string;
    applicationAccess: string;
  };
}

export interface UserSession {
  name: string;
  id: number;
  userRoles: string;
  applicationAccess: string;
}

export interface JwtPayload {
  name: string;
  sub: number;
  userRoles: string;
  applicationAccess: string;
  [key: string]: any;
}
