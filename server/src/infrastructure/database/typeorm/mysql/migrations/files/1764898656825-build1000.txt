import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001764898656825 implements MigrationInterface {
    name = 'Build10001764898656825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "activitylogs" DROP COLUMN "details"
        `);
        await queryRunner.query(`
            ALTER TABLE "activitylogs"
            ADD "details" json
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "activitylogs" DROP COLUMN "details"
        `);
        await queryRunner.query(`
            ALTER TABLE "activitylogs"
            ADD "details" jsonb
        `);
    }

}
