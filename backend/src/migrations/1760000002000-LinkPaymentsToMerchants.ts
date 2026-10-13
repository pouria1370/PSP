import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkPaymentsToMerchants1760000002000 implements MigrationInterface {
  name = "LinkPaymentsToMerchants1760000002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the old unique constraint.
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP CONSTRAINT "UQ_payments_merchant_idempotency_key"
    `);

    // The table is empty, so we can safely replace the column.
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "merchantId"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "merchantId" integer NOT NULL
    `);

    // Restore the idempotency constraint.
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "UQ_payments_merchant_idempotency_key"
      UNIQUE ("merchantId", "idempotencyKey")
    `);

    // Link each payment to an existing merchant.
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_payments_merchant"
      FOREIGN KEY ("merchantId")
      REFERENCES "merchants" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP CONSTRAINT "FK_payments_merchant"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP CONSTRAINT "UQ_payments_merchant_idempotency_key"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "merchantId"
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "merchantId" uuid NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "UQ_payments_merchant_idempotency_key"
      UNIQUE ("merchantId", "idempotencyKey")
    `);
  }
}
