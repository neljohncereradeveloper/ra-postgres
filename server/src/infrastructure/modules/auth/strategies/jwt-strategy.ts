import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * ! Strategy: JwtStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracting JWT from the Authorization header as a Bearer token.
      ignoreExpiration: false, // Token expiration is considered to enforce token validity.
      secretOrKey: configService.get<string>('JWT_SECRET'), // The JWT secret key is obtained from application configuration.
    });
  }

  /**
   * validates decoded JWT payload.
   *
   * @param payload - decoded token
   * @returns payload
   */
  async validate(payload: any) {
    // console.log('Calls `JwtStrategy.validate`');
    return {
      id: payload.sub,
      userName: payload.name,
      userRoles: payload.userRoles,
      applicationAccess: payload.applicationAccess,
      precinct: payload.precinct,
    };
  }
}
