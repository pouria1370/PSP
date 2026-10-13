import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMerchants1760000001000
  implements MigrationInterface
{
  name = "CreateMerchants1760000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "merchants" (
        "id" SERIAL NOT NULL,
        "name" varchar NOT NULL,
        "apiKey" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_merchants_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_merchants_apiKey" UNIQUE ("apiKey")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "merchants"`);
  }
}
