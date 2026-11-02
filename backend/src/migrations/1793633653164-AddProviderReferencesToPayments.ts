import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderReferencesToPayments1793633653164 implements MigrationInterface {
  name = "AddProviderReferencesToPayments1793633653164";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "providerRequestReference" varchar(128)
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "providerReference" varchar(128)
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_provider_request_reference"
      ON "payments" ("providerRequestReference")
      WHERE "providerRequestReference" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_provider_reference"
      ON "payments" ("providerReference")
      WHERE "providerReference" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_payments_provider_reference"
    `);

    await queryRunner.query(`
      DROP INDEX "UQ_payments_provider_request_reference"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "providerReference"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "providerRequestReference"
    `);
  }
}
