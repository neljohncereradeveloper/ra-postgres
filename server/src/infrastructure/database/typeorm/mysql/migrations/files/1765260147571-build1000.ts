import { MigrationInterface, QueryRunner } from "typeorm";

export class Build10001765260147571 implements MigrationInterface {
    name = 'Build10001765260147571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "activitylogs" (
                "id" SERIAL NOT NULL,
                "action" character varying(100) NOT NULL,
                "entity" character varying(100) NOT NULL,
                "details" json,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "username" character varying NOT NULL,
                CONSTRAINT "PK_faaf10621ef46508816a7cc3d2a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_268418d2d501fee64f6502683c" ON "activitylogs" ("timestamp")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_524890a26ecf0b038dd807f37b" ON "activitylogs" ("username")
        `);
        await queryRunner.query(`
            CREATE TABLE "applicationaccess" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_b4f80c8975f82f1a29d82520f1d" UNIQUE ("desc1"),
                CONSTRAINT "PK_479f6e0009396f7a04359ac2b38" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "applicationaccess"."deletedby" IS 'username of the user who deleted the application access';
            COMMENT ON COLUMN "applicationaccess"."createdby" IS 'username of the user who created the application access';
            COMMENT ON COLUMN "applicationaccess"."updatedby" IS 'username of the user who updated the application access'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f192ced536f055fa0c7c82cea6" ON "applicationaccess" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "cast_votes" (
                "id" SERIAL NOT NULL,
                "electionid" integer NOT NULL,
                "ballotnumber" character varying(100) NOT NULL,
                "precinct" character varying(100) NOT NULL,
                "candidateid" integer NOT NULL,
                "positionid" integer NOT NULL,
                "districtid" integer NOT NULL,
                "datetimecast" TIMESTAMP NOT NULL,
                "deletedat" TIMESTAMP,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_c517705477de134cab88deb868f" UNIQUE (
                    "electionid",
                    "ballotnumber",
                    "candidateid",
                    "positionid",
                    "districtid"
                ),
                CONSTRAINT "PK_87c1a57714450b86f281037cacc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70845e8811fa046d1528c4368d" ON "cast_votes" ("electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e949ceadeb8d24d1305279cd96" ON "cast_votes" ("ballotnumber")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_55b76d84df04e1a02449580b9f" ON "cast_votes" ("candidateid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0ba4befd043382d82854009c9b" ON "cast_votes" ("positionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ff4da6a688ad3bb30058231187" ON "cast_votes" ("districtid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4a2172f94ff0a2173ff59fe642" ON "cast_votes" ("datetimecast")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5a8a9785ba6533dd843ee10f21" ON "cast_votes" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_367346b1ebcf08781a9235a294" ON "cast_votes" ("ballotnumber", "electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c60f5a80226f5b6d9d1d1ca18d" ON "cast_votes" ("electionid", "deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "positions" (
                "id" SERIAL NOT NULL,
                "electionid" integer NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "maxcandidates" integer,
                "termlimit" character varying(100),
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_ad690500975f0ceeb7634b1db67" UNIQUE ("electionid", "desc1"),
                CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "positions"."deletedby" IS 'username of the user who deleted the position';
            COMMENT ON COLUMN "positions"."createdby" IS 'username of the user who created the position';
            COMMENT ON COLUMN "positions"."updatedby" IS 'username of the user who updated the position'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_33b652b357ae1d4974c7d01c18" ON "positions" ("electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0a5f6f3aae596e2cfa38e1deb6" ON "positions" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "candidates" (
                "id" SERIAL NOT NULL,
                "electionid" integer NOT NULL,
                "delegateid" integer NOT NULL,
                "positionid" integer NOT NULL,
                "districtid" integer NOT NULL,
                "displayname" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_574b3633a1ba153b333621b7fbc" UNIQUE ("electionid", "displayname"),
                CONSTRAINT "UQ_2aa96e4495baf2bf269d4b330d0" UNIQUE ("electionid", "delegateid"),
                CONSTRAINT "REL_2c975821cc7be7d64dc6f610a4" UNIQUE ("delegateid"),
                CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "candidates"."deletedby" IS 'username of the user who deleted the candidate';
            COMMENT ON COLUMN "candidates"."createdby" IS 'username of the user who created the candidate';
            COMMENT ON COLUMN "candidates"."updatedby" IS 'username of the user who updated the candidate'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_49e9fa229e72ff88a7e4a9ec85" ON "candidates" ("electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2c975821cc7be7d64dc6f610a4" ON "candidates" ("delegateid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cac084342cbf4174525ea2c7c3" ON "candidates" ("positionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_285ce626572a84df68ad96238e" ON "candidates" ("districtid")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."ballots_ballotstatus_enum" AS ENUM('pending', 'issued', 'cast', 'void')
        `);
        await queryRunner.query(`
            CREATE TABLE "ballots" (
                "id" SERIAL NOT NULL,
                "ballotnumber" character varying(100) NOT NULL,
                "delegateid" integer,
                "electionid" integer NOT NULL,
                "ballotstatus" "public"."ballots_ballotstatus_enum" NOT NULL DEFAULT 'pending',
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_db78e7cb75a10f078a8f2af667d" UNIQUE ("ballotnumber", "electionid"),
                CONSTRAINT "PK_1c29cf82a8045f839f8639634e9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5a30b142ecf0f2df4e276d6465" ON "ballots" ("ballotnumber")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4e54ab78c7984f30957fc7593f" ON "ballots" ("delegateid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_481b28094b36d615f0e7a9828e" ON "ballots" ("electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2e80fa9c88357ff96fb5e5d05d" ON "ballots" ("ballotstatus")
        `);
        await queryRunner.query(`
            CREATE TABLE "delegates" (
                "id" SERIAL NOT NULL,
                "electionid" integer NOT NULL,
                "branch" character varying(100) NOT NULL,
                "accountid" character varying(100) NOT NULL,
                "accountname" character varying(255) NOT NULL,
                "age" integer,
                "birthdate" date,
                "address" text,
                "tell" character varying(50),
                "cell" character varying(50),
                "dateopened" date,
                "clienttype" character varying(100),
                "loanstatus" character varying(100),
                "balance" numeric(15, 2) NOT NULL,
                "mevstatus" character varying(100) NOT NULL,
                "hasvoted" boolean NOT NULL DEFAULT false,
                "controlnumber" character varying NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_99752ded8f756f5620794b3aa66" UNIQUE ("electionid", "controlnumber"),
                CONSTRAINT "UQ_8c732ed7cfc65494646c28b9686" UNIQUE ("accountid", "electionid"),
                CONSTRAINT "PK_082736acecbc28020d855c5aa07" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "delegates"."deletedby" IS 'username of the user who deleted the delegate';
            COMMENT ON COLUMN "delegates"."createdby" IS 'username of the user who created the delegate';
            COMMENT ON COLUMN "delegates"."updatedby" IS 'username of the user who updated the delegate'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_17ca1a4d24de101c17ab01c1f9" ON "delegates" ("electionid")
        `);
        await queryRunner.query(`
            CREATE TABLE "active_election" (
                "id" SERIAL NOT NULL,
                "electionid" integer,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "REL_0da96e6cbf8bae00e9489d8447" UNIQUE ("electionid"),
                CONSTRAINT "PK_6fb5602ded6bde48a21c4b130c7" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "active_election"."createdby" IS 'username of the user who created the active election record';
            COMMENT ON COLUMN "active_election"."updatedby" IS 'username of the user who last updated the active election'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0da96e6cbf8bae00e9489d8447" ON "active_election" ("electionid")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."elections_electionstatus_enum" AS ENUM('scheduled', 'started', 'closed', 'cancelled')
        `);
        await queryRunner.query(`
            CREATE TABLE "elections" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "desc1" text,
                "address" text NOT NULL,
                "date" date,
                "starttime" TIMESTAMP,
                "endtime" TIMESTAMP,
                "maxattendees" integer,
                "electionstatus" "public"."elections_electionstatus_enum" NOT NULL DEFAULT 'scheduled',
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_506d405bcaab8205dded6cf6a02" UNIQUE ("name"),
                CONSTRAINT "PK_21abca6e4191b830d1eb8379cf0" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "elections"."deletedby" IS 'username of the user who deleted the election';
            COMMENT ON COLUMN "elections"."createdby" IS 'username of the user who created the election';
            COMMENT ON COLUMN "elections"."updatedby" IS 'username of the user who updated the election'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_dfee78f8fccb509a382a7f126f" ON "elections" ("electionstatus")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5f0dfa3b5d3b11dea03616d7d8" ON "elections" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "districts" (
                "id" SERIAL NOT NULL,
                "electionid" integer NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_eddf5db1fbaf67e64eba9a5809b" UNIQUE ("electionid", "desc1"),
                CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "districts"."deletedby" IS 'username of the user who deleted the district';
            COMMENT ON COLUMN "districts"."createdby" IS 'username of the user who created the district';
            COMMENT ON COLUMN "districts"."updatedby" IS 'username of the user who updated the district'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8550f8928e18d28737efb30edd" ON "districts" ("electionid")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_848dda7ce2ece63c446ea5afd0" ON "districts" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "userroles" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_42bca92ca87f98f1895fb16614f" UNIQUE ("desc1"),
                CONSTRAINT "PK_0f5953feb835cabaab6de9f4148" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "userroles"."deletedby" IS 'username of the user who deleted the user role';
            COMMENT ON COLUMN "userroles"."createdby" IS 'username of the user who created the user role';
            COMMENT ON COLUMN "userroles"."updatedby" IS 'username of the user who updated the user role'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d8cdcd273151a96deeb5863939" ON "userroles" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "precinct" character varying(100) NOT NULL,
                "watcher" character varying(100) NOT NULL,
                "applicationaccess" json NOT NULL,
                "userroles" json NOT NULL,
                "username" character varying(100) NOT NULL,
                "password" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "users"."deletedby" IS 'username of the user who deleted the user';
            COMMENT ON COLUMN "users"."createdby" IS 'username of the user who created the user';
            COMMENT ON COLUMN "users"."updatedby" IS 'username of the user who updated the user'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_58c6c079451daa7d8f0f8fc0ee" ON "users" ("deletedat")
        `);
        await queryRunner.query(`
            CREATE TABLE "precincts" (
                "id" SERIAL NOT NULL,
                "desc1" character varying(255) NOT NULL,
                "deletedby" character varying,
                "deletedat" TIMESTAMP,
                "createdby" character varying,
                "createdat" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedby" character varying,
                "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5811b7da8a8dc0437d2cfeb4b59" UNIQUE ("desc1"),
                CONSTRAINT "PK_7c9a6ec752db089790aabfff488" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "precincts"."deletedby" IS 'username of the user who deleted the precinct';
            COMMENT ON COLUMN "precincts"."createdby" IS 'username of the user who created the precinct';
            COMMENT ON COLUMN "precincts"."updatedby" IS 'username of the user who updated the precinct'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70a14a5fc908578f29a1f10eb7" ON "precincts" ("deletedat")
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_70845e8811fa046d1528c4368d8" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_55b76d84df04e1a02449580b9fd" FOREIGN KEY ("candidateid") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_0ba4befd043382d82854009c9b0" FOREIGN KEY ("positionid") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes"
            ADD CONSTRAINT "FK_ff4da6a688ad3bb30058231187c" FOREIGN KEY ("districtid") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "positions"
            ADD CONSTRAINT "FK_33b652b357ae1d4974c7d01c187" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_49e9fa229e72ff88a7e4a9ec851" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_cac084342cbf4174525ea2c7c34" FOREIGN KEY ("positionid") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_285ce626572a84df68ad96238e6" FOREIGN KEY ("districtid") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_2c975821cc7be7d64dc6f610a46" FOREIGN KEY ("delegateid") REFERENCES "delegates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ADD CONSTRAINT "FK_481b28094b36d615f0e7a9828e7" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots"
            ADD CONSTRAINT "FK_4e54ab78c7984f30957fc7593f7" FOREIGN KEY ("delegateid") REFERENCES "delegates"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "delegates"
            ADD CONSTRAINT "FK_17ca1a4d24de101c17ab01c1f95" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "active_election"
            ADD CONSTRAINT "FK_0da96e6cbf8bae00e9489d84477" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "districts"
            ADD CONSTRAINT "FK_8550f8928e18d28737efb30edde" FOREIGN KEY ("electionid") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "districts" DROP CONSTRAINT "FK_8550f8928e18d28737efb30edde"
        `);
        await queryRunner.query(`
            ALTER TABLE "active_election" DROP CONSTRAINT "FK_0da96e6cbf8bae00e9489d84477"
        `);
        await queryRunner.query(`
            ALTER TABLE "delegates" DROP CONSTRAINT "FK_17ca1a4d24de101c17ab01c1f95"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots" DROP CONSTRAINT "FK_4e54ab78c7984f30957fc7593f7"
        `);
        await queryRunner.query(`
            ALTER TABLE "ballots" DROP CONSTRAINT "FK_481b28094b36d615f0e7a9828e7"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_2c975821cc7be7d64dc6f610a46"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_285ce626572a84df68ad96238e6"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_cac084342cbf4174525ea2c7c34"
        `);
        await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_49e9fa229e72ff88a7e4a9ec851"
        `);
        await queryRunner.query(`
            ALTER TABLE "positions" DROP CONSTRAINT "FK_33b652b357ae1d4974c7d01c187"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_ff4da6a688ad3bb30058231187c"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_0ba4befd043382d82854009c9b0"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_55b76d84df04e1a02449580b9fd"
        `);
        await queryRunner.query(`
            ALTER TABLE "cast_votes" DROP CONSTRAINT "FK_70845e8811fa046d1528c4368d8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70a14a5fc908578f29a1f10eb7"
        `);
        await queryRunner.query(`
            DROP TABLE "precincts"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_58c6c079451daa7d8f0f8fc0ee"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d8cdcd273151a96deeb5863939"
        `);
        await queryRunner.query(`
            DROP TABLE "userroles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_848dda7ce2ece63c446ea5afd0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8550f8928e18d28737efb30edd"
        `);
        await queryRunner.query(`
            DROP TABLE "districts"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5f0dfa3b5d3b11dea03616d7d8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_dfee78f8fccb509a382a7f126f"
        `);
        await queryRunner.query(`
            DROP TABLE "elections"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."elections_electionstatus_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0da96e6cbf8bae00e9489d8447"
        `);
        await queryRunner.query(`
            DROP TABLE "active_election"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_17ca1a4d24de101c17ab01c1f9"
        `);
        await queryRunner.query(`
            DROP TABLE "delegates"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2e80fa9c88357ff96fb5e5d05d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_481b28094b36d615f0e7a9828e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4e54ab78c7984f30957fc7593f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5a30b142ecf0f2df4e276d6465"
        `);
        await queryRunner.query(`
            DROP TABLE "ballots"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."ballots_ballotstatus_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_285ce626572a84df68ad96238e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cac084342cbf4174525ea2c7c3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2c975821cc7be7d64dc6f610a4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_49e9fa229e72ff88a7e4a9ec85"
        `);
        await queryRunner.query(`
            DROP TABLE "candidates"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0a5f6f3aae596e2cfa38e1deb6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_33b652b357ae1d4974c7d01c18"
        `);
        await queryRunner.query(`
            DROP TABLE "positions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c60f5a80226f5b6d9d1d1ca18d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_367346b1ebcf08781a9235a294"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5a8a9785ba6533dd843ee10f21"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4a2172f94ff0a2173ff59fe642"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ff4da6a688ad3bb30058231187"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0ba4befd043382d82854009c9b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_55b76d84df04e1a02449580b9f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e949ceadeb8d24d1305279cd96"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70845e8811fa046d1528c4368d"
        `);
        await queryRunner.query(`
            DROP TABLE "cast_votes"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f192ced536f055fa0c7c82cea6"
        `);
        await queryRunner.query(`
            DROP TABLE "applicationaccess"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_524890a26ecf0b038dd807f37b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_268418d2d501fee64f6502683c"
        `);
        await queryRunner.query(`
            DROP TABLE "activitylogs"
        `);
    }

}
