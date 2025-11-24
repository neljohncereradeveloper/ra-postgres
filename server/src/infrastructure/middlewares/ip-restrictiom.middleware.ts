import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpRestrictiomMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Read comma-separated list of blocked IPs from environment
    const blockedIpsString = this.configService.get<string>('BLOCKED_IPS', '');
    const blockedIps = blockedIpsString
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip);

    // Determine client IP (trusts proxy if configured)
    const clientIp = req.ip;

    if (blockedIps.includes(clientIp)) {
      return res
        .status(403)
        .json({ statusCode: 403, message: 'Forbidden: your IP is blocked' });
    }

    next();
  }
}
