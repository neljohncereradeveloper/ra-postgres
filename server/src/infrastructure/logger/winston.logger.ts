import {
  WinstonModuleOptions,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console Transport
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('System Logs', {
          prettyPrint: true,
        }),
      ),
    }),
    // File Transport for Errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // File Transport for Combined Logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'debug',
    }),
  ],
};
