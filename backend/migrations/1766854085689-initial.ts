import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1766854085689 implements MigrationInterface {
  name = 'Initial1766854085689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'PENDING', "priority" "public"."tasks_priority_enum", "due_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_707cfc415c7c12d38dfc2ec8eb" ON "tasks" ("due_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd213ab7fa55f02309c5f23bbc" ON "tasks" ("priority") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6086c8dafbae729a930c04d865" ON "tasks" ("status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6086c8dafbae729a930c04d865"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd213ab7fa55f02309c5f23bbc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_707cfc415c7c12d38dfc2ec8eb"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
  }
}
