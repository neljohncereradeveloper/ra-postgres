// auth.module.ts
import { AuthAdapter } from '@infrastructure/modules/auth/adapters/auth.adapter';
import { Module } from '@nestjs/common';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { BcryptPasswordEncryptionAdapter } from '@infrastructure/modules/user/adapters/password-encryption.adapter';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UserRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/user.repository.impl';

@Module({
  imports: [
    MysqlDatabaseModule,
    PassportModule.register({
      session: false, // Disable session support for Passport
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: REPOSITORY_TOKENS.AUTH,
      useClass: AuthAdapter,
    },
    {
      provide: REPOSITORY_TOKENS.PASSWORDENCRYPTIONPORT,
      useClass: BcryptPasswordEncryptionAdapter,
    },
    { provide: REPOSITORY_TOKENS.USER, useClass: UserRepositoryImpl },

    LocalStrategy,
    JwtStrategy,
  ],
  exports: [REPOSITORY_TOKENS.AUTH, JwtStrategy],
})
export class AuthModule {}
