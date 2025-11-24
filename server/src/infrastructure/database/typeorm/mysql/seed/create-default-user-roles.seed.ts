import { EntityManager } from 'typeorm';
import { UserRoleEntity } from '../entities/user-role.entity';
import { Logger } from '@nestjs/common';

/**
 * SeedUserRoles
 *
 * Handles the seeding of user roles, ensuring that each role is created only if it doesn't already exist.
 */
export class SeedUserRoles {
  private readonly logger = new Logger('SeedUserRoles');

  constructor(private readonly dataSource: EntityManager) {}

  /**
   * Run the seeder to populate user roles.
   */
  async run(): Promise<void> {
    const userRoleRepository = this.dataSource.getRepository(UserRoleEntity);

    // Define the roles to seed
    const roles = ['Admin', 'Precinct'];

    for (const roleDesc of roles) {
      // Check if the role already exists
      const existingRole = await userRoleRepository.findOne({
        where: { desc1: roleDesc },
      });

      if (!existingRole) {
        // Insert the role if it does not exist
        await userRoleRepository.insert({ desc1: roleDesc });
        this.logger.log(`User role '${roleDesc}' created successfully.`);
      } else {
        this.logger.log(`User role '${roleDesc}' already exists.`);
      }
    }
  }
}
