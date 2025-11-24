import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001748051625725 implements MigrationInterface {
    name = 'Build10001748051625725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`activitylogs\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`action\` varchar(255) NOT NULL,
                \`entity\` varchar(255) NOT NULL,
                \`details\` text NULL,
                \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`applicationaccess\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`desc1\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_b4f80c8975f82f1a29d82520f1\` (\`desc1\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`cast_votes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`electionId\` int NOT NULL,
                \`ballotNumber\` varchar(255) NOT NULL,
                \`precinct\` varchar(255) NOT NULL,
                \`candidateId\` int NOT NULL,
                \`positionId\` int NOT NULL,
                \`districtId\` int NOT NULL,
                \`dateTimeCast\` datetime NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_c51fd09b2f3eefef29993b725b\` (
                    \`electionId\`,
                    \`ballotNumber\`,
                    \`candidateId\`,
                    \`positionId\`,
                    \`districtId\`
                ),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`positions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`electionId\` int NOT NULL,
                \`desc1\` varchar(255) NOT NULL,
                \`maxCandidates\` int NULL,
                \`termLimit\` varchar(255) NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_9290126add6f9a3b3edb8b37f0\` (\`electionId\`, \`desc1\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`candidates\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`electionId\` int NOT NULL,
                \`delegateId\` int NOT NULL,
                \`positionId\` int NOT NULL,
                \`districtId\` int NOT NULL,
                \`displayName\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_165726c847eb35a2a3d3c79dbe\` (\`electionId\`, \`displayName\`),
                UNIQUE INDEX \`IDX_1e0c7f6e7620e19e0e95e292d5\` (\`electionId\`, \`delegateId\`),
                UNIQUE INDEX \`REL_19c3dc0a8e19fc8545c9f8b86c\` (\`delegateId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`delegates\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`electionId\` int NOT NULL,
                \`branch\` varchar(255) NOT NULL,
                \`accountId\` varchar(255) NOT NULL,
                \`accountName\` varchar(255) NOT NULL,
                \`age\` int NULL,
                \`birthDate\` date NULL,
                \`address\` varchar(255) NULL,
                \`tell\` varchar(255) NULL,
                \`cell\` varchar(255) NULL,
                \`dateOpened\` date NULL,
                \`clientType\` varchar(255) NULL,
                \`loanStatus\` varchar(255) NULL,
                \`balance\` decimal(15, 2) NOT NULL,
                \`mevStatus\` varchar(255) NOT NULL,
                \`hasVoted\` tinyint NOT NULL DEFAULT 0,
                \`controlNumber\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_0102c98dd688a72749393669b8\` (\`electionId\`, \`controlNumber\`),
                UNIQUE INDEX \`IDX_9f0423fd4669843099e001de95\` (\`accountId\`, \`electionId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`settings\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`setupCode\` varchar(255) NULL,
                \`electionId\` int NULL,
                UNIQUE INDEX \`REL_f5aed9ec799764372a3c42f851\` (\`electionId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`elections\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`desc1\` varchar(255) NULL,
                \`address\` varchar(255) NOT NULL,
                \`date\` date NULL,
                \`startTime\` timestamp NULL,
                \`endTime\` timestamp NULL,
                \`maxAttendees\` int NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'scheduled',
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_506d405bcaab8205dded6cf6a0\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`districts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`electionId\` int NOT NULL,
                \`desc1\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_68cf6f3939ee322669878c3f0d\` (\`electionId\`, \`desc1\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`userroles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`desc1\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_42bca92ca87f98f1895fb16614\` (\`desc1\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`precinct\` varchar(255) NOT NULL,
                \`watcher\` varchar(255) NOT NULL,
                \`applicationAccess\` varchar(255) NOT NULL,
                \`userRoles\` varchar(255) NOT NULL,
                \`userName\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_226bb9aa7aa8a69991209d58f5\` (\`userName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`ballots\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`ballotNumber\` varchar(255) NOT NULL,
                \`delegateId\` int NULL,
                \`electionId\` int NOT NULL,
                \`status\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_0591c7e079c4830ecc0df24ce6\` (\`ballotNumber\`, \`electionId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`precincts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`desc1\` varchar(255) NOT NULL,
                \`deletedAt\` datetime(6) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_5811b7da8a8dc0437d2cfeb4b5\` (\`desc1\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\`
            ADD CONSTRAINT \`FK_554879a3233549f50632ddd4485\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\`
            ADD CONSTRAINT \`FK_ee67d6c68256f1962ce3a87f4e4\` FOREIGN KEY (\`candidateId\`) REFERENCES \`candidates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\`
            ADD CONSTRAINT \`FK_c04aea1108cdbf8d9d81c679d9d\` FOREIGN KEY (\`positionId\`) REFERENCES \`positions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\`
            ADD CONSTRAINT \`FK_7341758e2b325474f8e9f2738f9\` FOREIGN KEY (\`districtId\`) REFERENCES \`districts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`positions\`
            ADD CONSTRAINT \`FK_334ac6c9dbba3ee0efd8a5e3137\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\`
            ADD CONSTRAINT \`FK_a5c9743cdb2b629ccc67fb860f1\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\`
            ADD CONSTRAINT \`FK_43a4c8efc690d663b5ad815d8cf\` FOREIGN KEY (\`positionId\`) REFERENCES \`positions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\`
            ADD CONSTRAINT \`FK_4684499448e2d679f513be807ef\` FOREIGN KEY (\`districtId\`) REFERENCES \`districts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\`
            ADD CONSTRAINT \`FK_19c3dc0a8e19fc8545c9f8b86c5\` FOREIGN KEY (\`delegateId\`) REFERENCES \`delegates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`delegates\`
            ADD CONSTRAINT \`FK_fff676af35b30241ee75bf556a9\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`settings\`
            ADD CONSTRAINT \`FK_f5aed9ec799764372a3c42f8519\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`districts\`
            ADD CONSTRAINT \`FK_090290e42b8bba423a1f3da1068\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`ballots\`
            ADD CONSTRAINT \`FK_8300297eca22316e14587086954\` FOREIGN KEY (\`electionId\`) REFERENCES \`elections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`ballots\`
            ADD CONSTRAINT \`FK_5ffb96158e6656a7ca9eeea4671\` FOREIGN KEY (\`delegateId\`) REFERENCES \`delegates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`ballots\` DROP FOREIGN KEY \`FK_5ffb96158e6656a7ca9eeea4671\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`ballots\` DROP FOREIGN KEY \`FK_8300297eca22316e14587086954\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`districts\` DROP FOREIGN KEY \`FK_090290e42b8bba423a1f3da1068\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_f5aed9ec799764372a3c42f8519\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`delegates\` DROP FOREIGN KEY \`FK_fff676af35b30241ee75bf556a9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_19c3dc0a8e19fc8545c9f8b86c5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_4684499448e2d679f513be807ef\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_43a4c8efc690d663b5ad815d8cf\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_a5c9743cdb2b629ccc67fb860f1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`positions\` DROP FOREIGN KEY \`FK_334ac6c9dbba3ee0efd8a5e3137\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\` DROP FOREIGN KEY \`FK_7341758e2b325474f8e9f2738f9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\` DROP FOREIGN KEY \`FK_c04aea1108cdbf8d9d81c679d9d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\` DROP FOREIGN KEY \`FK_ee67d6c68256f1962ce3a87f4e4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cast_votes\` DROP FOREIGN KEY \`FK_554879a3233549f50632ddd4485\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_5811b7da8a8dc0437d2cfeb4b5\` ON \`precincts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`precincts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0591c7e079c4830ecc0df24ce6\` ON \`ballots\`
        `);
        await queryRunner.query(`
            DROP TABLE \`ballots\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_226bb9aa7aa8a69991209d58f5\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_42bca92ca87f98f1895fb16614\` ON \`userroles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`userroles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_68cf6f3939ee322669878c3f0d\` ON \`districts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`districts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_506d405bcaab8205dded6cf6a0\` ON \`elections\`
        `);
        await queryRunner.query(`
            DROP TABLE \`elections\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_f5aed9ec799764372a3c42f851\` ON \`settings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`settings\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9f0423fd4669843099e001de95\` ON \`delegates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0102c98dd688a72749393669b8\` ON \`delegates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`delegates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_19c3dc0a8e19fc8545c9f8b86c\` ON \`candidates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1e0c7f6e7620e19e0e95e292d5\` ON \`candidates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_165726c847eb35a2a3d3c79dbe\` ON \`candidates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`candidates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9290126add6f9a3b3edb8b37f0\` ON \`positions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`positions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c51fd09b2f3eefef29993b725b\` ON \`cast_votes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`cast_votes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b4f80c8975f82f1a29d82520f1\` ON \`applicationaccess\`
        `);
        await queryRunner.query(`
            DROP TABLE \`applicationaccess\`
        `);
        await queryRunner.query(`
            DROP TABLE \`activitylogs\`
        `);
    }

}
