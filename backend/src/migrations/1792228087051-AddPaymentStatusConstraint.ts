import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentStatusConstraint1792228087051 implements MigrationInterface {
  name = "AddPaymentStatusConstraint1792228087051";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "payments"
    ADD CONSTRAINT "CHK_payments_status_valid"
    CHECK (
      "status" IN (
        'PENDING',
        'AUTHORIZING',
        'AUTHORIZED',
        'SETTLED',
        'FAILED',
        'UNKNOWN',
        'CANCELLED'
      )
    )
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "payments"
    DROP CONSTRAINT "CHK_payments_status_valid"
  `);
  }
}
