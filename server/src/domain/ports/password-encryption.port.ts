export interface PasswordEncryptionPort {
  hash(password: string): Promise<string>;
  compare(password: string, hashed_password: string): Promise<boolean>;
}
