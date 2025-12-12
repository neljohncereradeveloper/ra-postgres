import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001765518109698 implements MigrationInterface {
    name = 'Build10001765518109698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "activitylogs" (
                "id" SERIAL NOT NULL,
                "action" character varying(100) NOT NULL,
                "entity" character varying(100) NOT NULL,
                "details" json,
                "occurred_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_name" character varying NOT NULL,
                CONSTRAINT "PK_faaf10621ef46508816a7cc3d2a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e5cb4e1e964be11054eb656cce" ON "activitylogs" ("occurred_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_45fe6eeda9f5b0ed5223753aae" ON "activitylogs" ("user_name")
        `);
        await queryRunner.query(`
            CREATE TABLE "applicationaccess" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_b4f80c8975f82f1a29d82520f1d" UNIQUE ("desc1"),
                CONSTRAINT "PK_479f6e0009396f7a04359ac2b38" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "applicationaccess"."deleted_by" IS 'username of the user who deleted the application access';
            COMMENT ON COLUMN "applicationaccess"."created_by" IS 'username of the user who created the application access';
            COMMENT ON COLUMN "applicationaccess"."updated_by" IS 'username of the user who updated the application access'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c5f1fffee177bbfa7da3f54fd5" ON "applicationaccess" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "cast_votes" (
                "id" SERIAL NOT NULL,
                "election_id" integer NOT NULL,
                "ballot_number" character varying(100) NOT NULL,
                "precinct" character varying(100) NOT NULL,
                "candidate_id" integer NOT NULL,
                "position_id" integer NOT NULL,
                "district_id" integer NOT NULL,
                "datetime_cast" TIMESTAMP NOT NULL,
                "deleted_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_9bf0d0a7c82764cdb43bd957aa0" UNIQUE (
                    "election_id",
                    "ballot_number",
                    "candidate_id",
                    "position_id",
                    "district_id"
                ),
                CONSTRAINT "PK_87c1a57714450b86f281037cacc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f282e1d8fc25717a06f6baada4" ON "cast_votes" ("election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2ee4a8226ccc33b8289ba97df2" ON "cast_votes" ("ballot_number")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d751d74a9ce5dd717e4e31d47b" ON "cast_votes" ("candidate_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7b2e0899bc4074815c5086bef8" ON "cast_votes" ("position_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8c579af8571aa993a808647e7a" ON "cast_votes" ("district_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0be1339b7870afc77599f69b51" ON "cast_votes" ("datetime_cast")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ec6d8eaa8b2972cbde08bc2550" ON "cast_votes" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9f9c1f38d59ac7160f8be69d10" ON "cast_votes" ("ballot_number", "election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_34c6beacf03960236066d174b7" ON "cast_votes" ("election_id", "deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "positions" (
                "id" SERIAL NOT NULL,
                "election_id" integer NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "max_candidates" integer,
                "term_limit" character varying(100),
                "sort_order" integer,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_483415f380f010dbbc67e0ea378" UNIQUE ("election_id", "desc1"),
                CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "positions"."deleted_by" IS 'username of the user who deleted the position';
            COMMENT ON COLUMN "positions"."created_by" IS 'username of the user who created the position';
            COMMENT ON COLUMN "positions"."updated_by" IS 'username of the user who updated the position'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9a7697e6bfad4fa9963501846a" ON "positions" ("election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_543350d1c901cd3db10411ea2d" ON "positions" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "candidates" (
                "id" SERIAL NOT NULL,
                "election_id" integer NOT NULL,
                "delegate_id" integer NOT NULL,
                "position_id" integer NOT NULL,
                "district_id" integer NOT NULL,
                "display_name" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_f6d103d4b9906ba9f8da8c09a9c" UNIQUE ("election_id", "display_name"),
                CONSTRAINT "UQ_e457e99def005a03b0bd015fcdd" UNIQUE ("election_id", "delegate_id"),
                CONSTRAINT "REL_1a70050e40874d6ee661d7c501" UNIQUE ("delegate_id"),
                CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "candidates"."deleted_by" IS 'username of the user who deleted the candidate';
            COMMENT ON COLUMN "candidates"."created_by" IS 'username of the user who created the candidate';
            COMMENT ON COLUMN "candidates"."updated_by" IS 'username of the user who updated the candidate'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_32673ff5618c85a5ac2620e7cd" ON "candidates" ("election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1a70050e40874d6ee661d7c501" ON "candidates" ("delegate_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7e1a499220a4c395b9871beb04" ON "candidates" ("position_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8fca9eadf5e963beac01aa8187" ON "candidates" ("district_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."ballots_ballot_status_enum" AS ENUM('pending', 'issued', 'submitted', 'cast', 'void')
        `);
        await queryRunner.query(`
            CREATE TABLE "ballots" (
                "id" SERIAL NOT NULL,
                "ballot_number" character varying(100) NOT NULL,
                "delegate_id" integer,
                "election_id" integer NOT NULL,
                "ballot_status" "public"."ballots_ballot_status_enum" NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_43ba220bc0a71380e234f75a0e0" UNIQUE ("ballot_number", "election_id"),
                CONSTRAINT "PK_1c29cf82a8045f839f8639634e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2f0ca95cfb82dc9191a65f9780" ON "ballots" ("ballot_number")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ba088b64661a892aaa44c36e5e" ON "ballots" ("delegate_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_599022089771555178cb9f63db" ON "ballots" ("election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d28c76dbe73d1533aa24b1529d" ON "ballots" ("ballot_status")
        `);
        await queryRunner.query(`
            CREATE TABLE "delegates" (
                "id" SERIAL NOT NULL,
                "election_id" integer NOT NULL,
                "branch" character varying(100) NOT NULL,
                "account_id" character varying(100) NOT NULL,
                "account_name" character varying(255) NOT NULL,
                "age" integer,
                "birth_date" date,
                "address" text,
                "tell" character varying(50),
                "cell" character varying(50),
                "date_opened" date,
                "client_type" character varying(100),
                "loan_status" character varying(100),
                "balance" numeric(15, 2) NOT NULL,
                "mev_status" character varying(100) NOT NULL,
                "has_voted" boolean NOT NULL DEFAULT false,
                "control_number" character varying NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_67d01f457d9f2088ffe70080d52" UNIQUE ("election_id", "control_number"),
                CONSTRAINT "UQ_5f853d32cd6d2c76677d8c4cee6" UNIQUE ("account_id", "election_id"),
                CONSTRAINT "PK_082736acecbc28020d855c5aa07" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "delegates"."deleted_by" IS 'username of the user who deleted the delegate';
            COMMENT ON COLUMN "delegates"."created_by" IS 'username of the user who created the delegate';
            COMMENT ON COLUMN "delegates"."updated_by" IS 'username of the user who updated the delegate'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5b34fd0e13d88c02567da278f2" ON "delegates" ("election_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "active_election" (
                "id" SERIAL NOT NULL,
                "election_id" integer,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_5684fe6774904ba9966906acf2" UNIQUE ("election_id"),
                CONSTRAINT "PK_6fb5602ded6bde48a21c4b130c7" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "active_election"."created_by" IS 'username of the user who created the active election record';
            COMMENT ON COLUMN "active_election"."updated_by" IS 'username of the user who last updated the active election'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5684fe6774904ba9966906acf2" ON "active_election" ("election_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."elections_election_status_enum" AS ENUM('scheduled', 'started', 'closed', 'cancelled')
        `);
        await queryRunner.query(`
            CREATE TABLE "elections" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "desc1" text,
                "address" text NOT NULL,
                "date" date,
                "start_time" TIME,
                "end_time" TIME,
                "max_attendees" integer,
                "election_status" "public"."elections_election_status_enum" NOT NULL DEFAULT 'scheduled',
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_506d405bcaab8205dded6cf6a02" UNIQUE ("name"),
                CONSTRAINT "PK_21abca6e4191b830d1eb8379cf0" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "elections"."deleted_by" IS 'username of the user who deleted the election';
            COMMENT ON COLUMN "elections"."created_by" IS 'username of the user who created the election';
            COMMENT ON COLUMN "elections"."updated_by" IS 'username of the user who updated the election'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bd3ba0b7f631aa3038d193f29b" ON "elections" ("election_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b6ff0c89b29b441ab9acedbf67" ON "elections" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "districts" (
                "id" SERIAL NOT NULL,
                "election_id" integer NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e42efe9bb59539bc4b1637a0590" UNIQUE ("election_id", "desc1"),
                CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "districts"."deleted_by" IS 'username of the user who deleted the district';
            COMMENT ON COLUMN "districts"."created_by" IS 'username of the user who created the district';
            COMMENT ON COLUMN "districts"."updated_by" IS 'username of the user who updated the district'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1d950e4683af764612ccf452ba" ON "districts" ("election_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b206ecf9aa35841cd948c25cfe" ON "districts" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "userroles" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_42bca92ca87f98f1895fb16614f" UNIQUE ("desc1"),
                CONSTRAINT "PK_0f5953feb835cabaab6de9f4148" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "userroles"."deleted_by" IS 'username of the user who deleted the user role';
            COMMENT ON COLUMN "userroles"."created_by" IS 'username of the user who created the user role';
            COMMENT ON COLUMN "userroles"."updated_by" IS 'username of the user who updated the user role'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5778c8bab2318a4854179c7ace" ON "userroles" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "precinct" character varying(100) NOT NULL,
                "watcher" character varying(100) NOT NULL,
                "application_access" json NOT NULL,
                "user_roles" json NOT NULL,
                "user_name" character varying(100) NOT NULL,
                "password" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "users"."deleted_by" IS 'username of the user who deleted the user';
            COMMENT ON COLUMN "users"."created_by" IS 'username of the user who created the user';
            COMMENT ON COLUMN "users"."updated_by" IS 'username of the user who updated the user'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_073999dfec9d14522f0cf58cd6" ON "users" ("deleted_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "precincts" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                "created_by" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5811b7da8a8dc0437d2cfeb4b59" UNIQUE ("desc1"),
                CONSTRAINT "PK_7c9a6ec752db089790aabfff488" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "precincts"."deleted_by" IS 'username of the user who deleted the precinct';
            COMMENT ON COLUMN "precincts"."created_by" IS 'username of the user who created the precinct';
            COMMENT ON COLUMN "precincts"."updated_by" IS 'username of the user who updated the precinct'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6111e691abb4134ff7281cac5c" ON "precincts" ("deleted_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_f282e1d8fc25717a06f6baada49" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_d751d74a9ce5dd717e4e31d47b1" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_7b2e0899bc4074815c5086bef86" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_8c579af8571aa993a808647e7a8" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "positions"
            ADD CONSTRAINT "FK_9a7697e6bfad4fa9963501846ab" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_32673ff5618c85a5ac2620e7cd0" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_7e1a499220a4c395b9871beb044" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_8fca9eadf5e963beac01aa8187d" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_1a70050e40874d6ee661d7c5016" FOREIGN KEY ("delegate_id") REFERENCES "delegates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ADD CONSTRAINT "FK_599022089771555178cb9f63db2" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ADD CONSTRAINT "FK_ba088b64661a892aaa44c36e5ea" FOREIGN KEY ("delegate_id") REFERENCES "delegates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "delegates"
            ADD CONSTRAINT "FK_5b34fd0e13d88c02567da278f25" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "active_election"
            ADD CONSTRAINT "FK_5684fe6774904ba9966906acf29" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "districts"
            ADD CONSTRAINT "FK_1d950e4683af764612ccf452ba1" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "districts" DROP CONSTRAINT "FK_1d950e4683af764612ccf452ba1"
        `);
        await queryRunner.query(`
            ALTER TABLE "active_election" DROP CONSTRAINT "FK_5684fe6774904ba9966906acf29"
        `);
        await queryRunner.query(`
            ALTER TABLE "delegates" DROP CONSTRAINT "FK_5b34fd0e13d88c02567da278f25"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots" DROP CONSTRAINT "FK_ba088b64661a892aaa44c36e5ea"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots" DROP CONSTRAINT "FK_599022089771555178cb9f63db2"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_1a70050e40874d6ee661d7c5016"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_8fca9eadf5e963beac01aa8187d"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_7e1a499220a4c395b9871beb044"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_32673ff5618c85a5ac2620e7cd0"
        `);
        await queryRunner.query(`
            ALTER TABLE "positions" DROP CONSTRAINT "FK_9a7697e6bfad4fa9963501846ab"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_8c579af8571aa993a808647e7a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_7b2e0899bc4074815c5086bef86"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_d751d74a9ce5dd717e4e31d47b1"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_f282e1d8fc25717a06f6baada49"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6111e691abb4134ff7281cac5c"
        `);
        await queryRunner.query(`
            DROP TABLE "precincts"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_073999dfec9d14522f0cf58cd6"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5778c8bab2318a4854179c7ace"
        `);
        await queryRunner.query(`
            DROP TABLE "userroles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b206ecf9aa35841cd948c25cfe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1d950e4683af764612ccf452ba"
        `);
        await queryRunner.query(`
            DROP TABLE "districts"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b6ff0c89b29b441ab9acedbf67"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bd3ba0b7f631aa3038d193f29b"
        `);
        await queryRunner.query(`
            DROP TABLE "elections"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."elections_election_status_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5684fe6774904ba9966906acf2"
        `);
        await queryRunner.query(`
            DROP TABLE "active_election"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5b34fd0e13d88c02567da278f2"
        `);
        await queryRunner.query(`
            DROP TABLE "delegates"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d28c76dbe73d1533aa24b1529d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_599022089771555178cb9f63db"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ba088b64661a892aaa44c36e5e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2f0ca95cfb82dc9191a65f9780"
        `);
        await queryRunner.query(`
            DROP TABLE "ballots"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."ballots_ballot_status_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8fca9eadf5e963beac01aa8187"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7e1a499220a4c395b9871beb04"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1a70050e40874d6ee661d7c501"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_32673ff5618c85a5ac2620e7cd"
        `);
        await queryRunner.query(`
            DROP TABLE "candidates"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_543350d1c901cd3db10411ea2d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9a7697e6bfad4fa9963501846a"
        `);
        await queryRunner.query(`
            DROP TABLE "positions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_34c6beacf03960236066d174b7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9f9c1f38d59ac7160f8be69d10"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ec6d8eaa8b2972cbde08bc2550"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0be1339b7870afc77599f69b51"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8c579af8571aa993a808647e7a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7b2e0899bc4074815c5086bef8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d751d74a9ce5dd717e4e31d47b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2ee4a8226ccc33b8289ba97df2"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f282e1d8fc25717a06f6baada4"
        `);
        await queryRunner.query(`
            DROP TABLE "cast_votes"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c5f1fffee177bbfa7da3f54fd5"
        `);
        await queryRunner.query(`
            DROP TABLE "applicationaccess"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_45fe6eeda9f5b0ed5223753aae"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e5cb4e1e964be11054eb656cce"
        `);
        await queryRunner.query(`
            DROP TABLE "activitylogs"
        `);
    }

}
