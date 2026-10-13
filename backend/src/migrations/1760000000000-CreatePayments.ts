import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayments1760000000000 implements MigrationInterface {
  name = "CreatePayments1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "merchantId" uuid NOT NULL,
        "orderId" varchar(100) NOT NULL,
        "amount" bigint NOT NULL,
        "currency" varchar(3) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "idempotencyKey" varchar(128) NOT NULL,
        "requestHash" varchar(64) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_merchant_idempotency_key"
          UNIQUE ("merchantId", "idempotencyKey"),
        CONSTRAINT "CHK_payments_amount_positive"
          CHECK ("amount" > 0)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}
