import { MigrationInterface, QueryRunner } from "typeorm";
export class CreatePaymentInquiries1792700000000 implements MigrationInterface {
  name = "CreatePaymentInquiries1792700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payment_inquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "paymentId" uuid NOT NULL,
        "attemptNumber" integer NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "result" varchar(20),
        "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "completedAt" TIMESTAMPTZ,
        "errorCode" varchar(100),
        "errorMessage" text,
        CONSTRAINT "PK_payment_inquiries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payment_inquiries_payment_attempt"
          UNIQUE ("paymentId", "attemptNumber"),
        CONSTRAINT "FK_payment_inquiries_payment"
          FOREIGN KEY ("paymentId")
          REFERENCES "payments"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_inquiries"
      ADD CONSTRAINT "CHK_payment_inquiries_attempt_positive"
      CHECK ("attemptNumber" > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_inquiries"
      ADD CONSTRAINT "CHK_payment_inquiries_status_valid"
      CHECK ("status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_inquiries"
      ADD CONSTRAINT "CHK_payment_inquiries_result_valid"
      CHECK (
        "result" IS NULL OR
        "result" IN ('CONFIRMED', 'NOT_FOUND', 'PENDING', 'UNKNOWN')
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment_inquiries"`);
  }
}
