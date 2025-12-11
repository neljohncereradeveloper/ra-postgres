import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001765418918061 implements MigrationInterface {
    name = 'Build10001765418918061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."ballots_ballot_status_enum"
            RENAME TO "ballots_ballot_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."ballots_ballot_status_enum" AS ENUM('pending', 'issued', 'submitted', 'cast', 'void')
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status" TYPE "public"."ballots_ballot_status_enum" USING "ballot_status"::"text"::"public"."ballots_ballot_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status"
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."ballots_ballot_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."ballots_ballot_status_enum_old" AS ENUM('pending', 'issued', 'cast', 'void')
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status" TYPE "public"."ballots_ballot_status_enum_old" USING "ballot_status"::"text"::"public"."ballots_ballot_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ALTER COLUMN "ballot_status"
            SET DEFAULT 'pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."ballots_ballot_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."ballots_ballot_status_enum_old"
            RENAME TO "ballots_ballot_status_enum"
        `);
    }

}
