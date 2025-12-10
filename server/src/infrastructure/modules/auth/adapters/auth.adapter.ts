import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordEncryptionPort } from '@domain/ports/password-encryption.port';
import { User } from '@domain/models/user.model';
import { AuthPort } from '@domain/ports/auth.port';
import { UserRepository } from '@domains/repositories/user.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class AuthAdapter implements AuthPort {
  logger = new Logger('AuthService');
  constructor(
    @Inject(REPOSITORY_TOKENS.PASSWORDENCRYPTIONPORT)
    private readonly passwordEncryptionPort: PasswordEncryptionPort,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * proccess 1
   * validates a user's credentials
   *
   * @param user_name - user username
   * @param password - user password
   * @returns user
   */
  async validateUser(user_name: string, password: string): Promise<any> {
    // find user by username
    const user = await this.userRepository.findByUserName(user_name);

    if (!user) {
      throw new BadRequestException('Invalid credentials.');
    }

    // if account isdisable throw error
    if (user?.deleted_at) {
      throw new BadRequestException('Account deleted.');
    }

    // validate user
    if (user) {
      // validate password
      const isMatch = await this.passwordEncryptionPort.compare(
        password,
        user?.password,
      );
      if (isMatch) {
        // return user
        return {
          id: user.id,
          user_name: user.user_name,
          user_roles: user.user_roles,
          application_access: user.application_access,
          precinct: user.precinct,
        };
      }
    }

    return null;
  }

  /**
   * process 2
   * generates JWT token validateUser user.
   *
   * @param user - user
   * @returns token and payload
   */
  login(user: User) {
    const payload = {
      name: user.user_name,
      sub: user.id,
      user_roles: user.user_roles,
      application_access: user.application_access,
      precinct: user.precinct,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      payload,
    };
  }

  /**
   * verifies a JWT token.
   *
   * @param token - The JWT token to verify.
   * @returns - decoded token
   */
  async jwtVerify(token: any) {
    try {
      // Decode and verify the JWT token
      const decodedToken = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Return the decoded token
      return decodedToken;
    } catch (error) {
      // Handle specific JWT errors based on error name or message
      if (error.name === 'TokenExpiredError') {
        this.logger.error(`Token expired: ${error.message}`, error.stack);
        throw new BadRequestException(
          'Session has expired. Please log in again.',
        );
      }

      if (
        error.name === 'JsonWebTokenError' &&
        error.message === 'invalid signature'
      ) {
        this.logger.error(
          `Invalid token signature: ${error.message}`,
          error.stack,
        );
        throw new UnauthorizedException(
          'Invalid token signature. Please provide a valid token.',
        );
      }

      // Handle generic JWT or unexpected errors
      this.logger.error(
        `JWT verification error: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Something went wrong during token verification.',
      );
    }
  }
}
