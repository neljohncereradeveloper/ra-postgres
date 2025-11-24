import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuthPort } from '@domain/ports/auth.port';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

/**
 * ! Strategy: LocalStrategy
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  logger = new Logger('LocalStrategy');
  constructor(
    @Inject(REPOSITORY_TOKENS.AUTH)
    private readonly authPort: AuthPort,
  ) {
    super(); // Initializing the parent class (PassportStrategy) with default settings.
  }

  /**
   * Validates a user's credentials.
   *
   * @param username - The username provided by the user.
   * @param password - The password provided by the user.
   * @returns The validated user object.
   * @throws NotFoundException if the user cannot be authenticated.
   */
  async validate(username: string, password: string): Promise<any> {
    // console.log('Calls `LocalStrategy.validate`');
    // calls authService.validateUser
    const user = await this.authPort.validateUser(username, password);
    // validate user
    if (!user) {
      // log
      this.logger.log(`Invalid Credentials [ user:${username} ].`);
      throw new NotFoundException({
        success: false,
        message: 'Invalid Credentials.',
      });
    }

    // return user
    return user;
  }
}
