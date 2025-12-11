import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001765415553787 implements MigrationInterface {
    name = 'Build10001765415553787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "elections" DROP COLUMN "start_time"
        `);
        await queryRunner.query(`
            ALTER TABLE "elections"
            ADD "start_time" TIME
        `);
        await queryRunner.query(`
            ALTER TABLE "elections" DROP COLUMN "end_time"
        `);
        await queryRunner.query(`
            ALTER TABLE "elections"
            ADD "end_time" TIME
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "elections" DROP COLUMN "end_time"
        `);
        await queryRunner.query(`
            ALTER TABLE "elections"
            ADD "end_time" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "elections" DROP COLUMN "start_time"
        `);
        await queryRunner.query(`
            ALTER TABLE "elections"
            ADD "start_time" TIMESTAMP
        `);
    }

}
