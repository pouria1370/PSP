const test = require("node:test");
const assert = require("node:assert/strict");
const { DataSource } = require("typeorm");
const { config } = require("dotenv");

const { Payment } = require("../dist/payment/payment.entity");
const { Merchant } = require("../dist/merchant/merchant.entity");

const {
  PaymentInquiry,
  PaymentInquiryResult,
  PaymentInquiryStatus,
} = require("../dist/payment/payment-inquiry.entity");

const {
  PaymentInquiryService,
} = require("../dist/payment/payment-inquiry.service");

const {
  PaymentInquiryDecisionService,
  PaymentInquiryAction,
} = require("../dist/payment/payment-inquiry-decision.service");

const {
  PaymentInquiryWorkflowService,
} = require("../dist/payment/payment-inquiry-workflow.service");

const { PaymentService } = require("../dist/payment/payment.service");
const { PaymentStatus } = require("../dist/payment/payment-status.enum");

config();

test("confirmed inquiry requires review without changing UNKNOWN payment", async () => {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5433),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: [Payment, Merchant, PaymentInquiry],
    synchronize: false,
  });

  await dataSource.initialize();

  let paymentId;

  try {
    const paymentRepository = dataSource.getRepository(Payment);
    const inquiryRepository = dataSource.getRepository(PaymentInquiry);
    const merchantRepository = dataSource.getRepository(Merchant);

    const merchant = await merchantRepository.findOneBy({ id: 4 });
    assert.ok(merchant, "Merchant 4 must exist");

    const suffix = `${Date.now()}-${Math.random()}`;

    const payment = await paymentRepository.save(
      paymentRepository.create({
        merchantId: merchant.id,
        orderId: `workflow-integration-${suffix}`,
        amount: "1000",
        currency: "IRR",
        status: PaymentStatus.UNKNOWN,
        idempotencyKey: `workflow-integration-${suffix}`,
        requestHash: "workflow-integration-test",
      }),
    );

    paymentId = payment.id;

    const inquiryService = new PaymentInquiryService(
      inquiryRepository,
      paymentRepository,
      dataSource,
    );

    const paymentService = new PaymentService(paymentRepository);
    const decisionService = new PaymentInquiryDecisionService();

    const workflow = new PaymentInquiryWorkflowService(
      inquiryService,
      paymentService,
      decisionService,
    );

    const inquiry = await inquiryService.createInquiry(paymentId);

    await inquiryService.markProcessing(inquiry.id);

    await inquiryService.completeInquiry(
      inquiry.id,
      PaymentInquiryResult.CONFIRMED,
    );

    const decision = await workflow.evaluate(inquiry.id);

    assert.equal(decision.action, PaymentInquiryAction.REQUIRE_REVIEW);

    const storedInquiry = await inquiryRepository.findOneBy({
      id: inquiry.id,
    });

    const storedPayment = await paymentRepository.findOneBy({
      id: paymentId,
    });

    assert.equal(storedInquiry.status, PaymentInquiryStatus.COMPLETED);
    assert.equal(storedInquiry.result, PaymentInquiryResult.CONFIRMED);
    assert.equal(storedPayment.status, PaymentStatus.UNKNOWN);
  } finally {
    if (paymentId) {
      await dataSource.getRepository(PaymentInquiry).delete({ paymentId });
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }

    await dataSource.destroy();
  }
});
