import { EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config as dotenvConfig } from 'dotenv';
import { ApplicationAccessEntity } from '../entities/application-access.entity';
import { getPHDateTime } from '../../../../../domain/utils/format-ph-time';

// Load environment variables from .env
dotenvConfig();

export class SeedUsers {
  private readonly logger = new Logger('SeedUsers');

  constructor(private readonly dataSource: EntityManager) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const userRoleRepository = this.dataSource.getRepository(UserRoleEntity);
    const applicationAccessRepository = this.dataSource.getRepository(
      ApplicationAccessEntity,
    );

    // Fetch the 'Admin' role
    const adminRole = await userRoleRepository.findOneBy({
      desc1: 'admin',
    });

    if (!adminRole) {
      this.logger.error('Admin role not found. Cannot create admin user.');
      return;
    }

    // Fetch the 'Admin module' application access
    const adminModuleApplicationAccess =
      await applicationAccessRepository.findOneBy({
        desc1: 'admin module',
      });

    if (!adminModuleApplicationAccess) {
      this.logger.error(
        'Admin module application access not found. Cannot create admin user.',
      );
      return;
    }

    const electionModuleApplicationAccess =
      await applicationAccessRepository.findOneBy({
        desc1: 'election module',
      });

    if (!electionModuleApplicationAccess) {
      this.logger.error(
        'Election module application access not found. Cannot create admin user.',
      );
      return;
    }

    const hashPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const adminUserData = {
      watcher: 'default',
      precinct: 'default',
      application_access: [
        adminModuleApplicationAccess.desc1,
        electionModuleApplicationAccess.desc1,
      ],
      user_roles: [adminRole.desc1],
      user_name: 'admin',
      password: hashPassword,
      created_by: 'system',
      created_at: getPHDateTime(),
    };
    // Check if the super admin user already exists
    const existingAdmin = await userRepository.findOneBy({
      user_name: adminUserData.user_name,
    });
    if (!existingAdmin) {
      const newAdmin = userRepository.create(adminUserData);
      await userRepository.save(newAdmin);
      this.logger.log(
        `Admin user '${adminUserData.user_name}' created successfully.`,
      );
    } else {
      this.logger.log(
        `Admin user '${adminUserData.user_name}' already exists.`,
      );
    }
  }
}
