import { EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config as dotenvConfig } from 'dotenv';
import { ApplicationAccessEntity } from '../entities/application-access.entity';

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
      desc1: 'Admin',
    });

    if (!adminRole) {
      this.logger.error('Admin role not found. Cannot create admin user.');
      return;
    }

    // Fetch the 'Admin Module' application access
    const adminModuleApplicationAccess =
      await applicationAccessRepository.findOneBy({
        desc1: 'Admin Module',
      });

    if (!adminModuleApplicationAccess) {
      this.logger.error(
        'Admin Module application access not found. Cannot create admin user.',
      );
      return;
    }

    const electionManagementModuleApplicationAccess =
      await applicationAccessRepository.findOneBy({
        desc1: 'Election Management Module',
      });

    if (!electionManagementModuleApplicationAccess) {
      this.logger.error(
        'Election Management Module application access not found. Cannot create admin user.',
      );
      return;
    }

    const hashPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const adminUserData = {
      watcher: 'Default',
      precinct: 'Default',
      applicationAccess: `${adminModuleApplicationAccess.desc1}, ${electionManagementModuleApplicationAccess.desc1}`,
      userRoles: adminRole.desc1,
      userName: 'admin',
      password: hashPassword,
    };
    // Check if the super admin user already exists
    const existingAdmin = await userRepository.findOneBy({
      userName: adminUserData.userName,
    });
    if (!existingAdmin) {
      const newAdmin = userRepository.create(adminUserData);
      await userRepository.save(newAdmin);
      this.logger.log(
        `Admin user '${adminUserData.userName}' created successfully.`,
      );
    } else {
      this.logger.log(`Admin user '${adminUserData.userName}' already exists.`);
    }
  }
}
