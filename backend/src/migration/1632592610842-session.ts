import { MigrationInterface, QueryRunner } from 'typeorm';

export class session1632592610842 implements MigrationInterface {
  name = 'session1632592610842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "type_orm_session" ("expiredAt" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL, CONSTRAINT "PK_1a98d1dcb141c81690d991f1e5d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e605661de8a51f343e2889ac4" ON "type_orm_session" ("expiredAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."users" ALTER COLUMN "avatar" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."users" ALTER COLUMN "avatar" DROP NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX "IDX_4e605661de8a51f343e2889ac4"`);
    await queryRunner.query(`DROP TABLE "type_orm_session"`);
  }
}
