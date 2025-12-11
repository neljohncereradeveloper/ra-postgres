import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001765411688448 implements MigrationInterface {
    name = 'Build10001765411688448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "positions"
            ADD "sort_order" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "positions" DROP COLUMN "sort_order"
        `);
    }

}
