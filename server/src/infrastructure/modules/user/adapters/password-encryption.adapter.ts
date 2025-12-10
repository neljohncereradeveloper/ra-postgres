import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordEncryptionPort } from '@domain/ports/password-encryption.port';

@Injectable()
export class BcryptPasswordEncryptionAdapter implements PasswordEncryptionPort {
  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      // Log and rethrow an infrastructure-level error
      console.error('Error during password encryption:', error);
      throw new InternalServerErrorException('Failed to hash the password');
    }
  }

  async compare(password: string, hashed_password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashed_password);
    } catch (error) {
      console.error('Error during password comparison:', error);
      throw new InternalServerErrorException('Password verification failed');
    }
  }
}
