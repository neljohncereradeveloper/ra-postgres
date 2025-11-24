import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeormConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = configService.get<'mysql' | 'postgres'>('DB_TYPE', 'postgres');
  const isPostgres = dbType === 'postgres';

  const baseConfig: TypeOrmModuleOptions = {
    type: dbType,
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [
      'dist/infrastructure/database/typeorm/mysql/entities/**/*.entity.js',
    ], // this uses the compiled entites in the dist folder
    synchronize: false, // Disable in production
    logging: configService.get<boolean>('DB_LOGGING', false),
  };

  // PostgreSQL-specific configurations
  if (isPostgres) {
    const sslEnabled = configService.get<string>('DB_SSL') === 'true';

    return {
      ...baseConfig,
      // PostgreSQL connection pool settings
      extra: {
        max: configService.get<number>('DB_POOL_MAX', 10), // Maximum pool size
        min: configService.get<number>('DB_POOL_MIN', 2), // Minimum pool size
        idleTimeoutMillis: configService.get<number>(
          'DB_POOL_IDLE_TIMEOUT',
          30000,
        ),
        connectionTimeoutMillis: configService.get<number>(
          'DB_POOL_CONNECTION_TIMEOUT',
          2000,
        ),
        // SSL configuration (for production PostgreSQL)
        ...(sslEnabled && {
          ssl: {
            rejectUnauthorized:
              configService.get<string>(
                'DB_SSL_REJECT_UNAUTHORIZED',
                'false',
              ) === 'true',
          },
        }),
      },
    } as TypeOrmModuleOptions;
  }

  // MySQL-specific configurations
  return {
    ...baseConfig,
    extra: {
      connectionLimit: configService.get<number>('DB_POOL_MAX', 10),
    },
  } as TypeOrmModuleOptions;
};
