import { AuthPort } from '@domain/ports/auth.port';
import {
  Controller,
  Inject,
  Logger,
  Post,
  Request,
  UseGuards,
  Version,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginRateLimitingGuard } from '../guards/login.ratelimit.guard';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Controller('auth')
export class AuthController {
  logger = new Logger('LOGIN');
  constructor(@Inject(REPOSITORY_TOKENS.AUTH) private authPort: AuthPort) {}

  @Version('1')
  @UseGuards(LoginRateLimitingGuard, LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    /** calls authservice login */
    const user = this.authPort.login(req.user);

    /** log user loginS */
    this.logger.log(`login successfully [ user:${user.payload.name} ]`);

    return user;
  }
}
