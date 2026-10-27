const test = require("node:test");
const assert = require("node:assert/strict");
const { DataSource } = require("typeorm");
const { config } = require("dotenv");

const { Payment } = require("../dist/payment/payment.entity");
const { Merchant } = require("../dist/merchant/merchant.entity");
const { PaymentInquiry } = require("../dist/payment/payment-inquiry.entity");
const {
  PaymentInquiryService,
} = require("../dist/payment/payment-inquiry.service");
const { PaymentStatus } = require("../dist/payment/payment-status.enum");

config();

test("concurrent inquiries receive unique sequential attempt numbers", async () => {
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
    const merchantRepository = dataSource.getRepository(Merchant);
    const inquiryRepository = dataSource.getRepository(PaymentInquiry);

    const merchant = await merchantRepository.findOneBy({ id: 4 });
    assert.ok(merchant, "Merchant 4 must exist");

    const uniqueSuffix = `${Date.now()}-${Math.random()}`;

    const payment = paymentRepository.create({
      merchantId: merchant.id,
      orderId: `inquiry-concurrency-${uniqueSuffix}`,
      amount: "1000",
      currency: "IRR",
      status: PaymentStatus.PENDING,
      idempotencyKey: `inquiry-concurrency-${uniqueSuffix}`,
      requestHash: "inquiry-concurrency-test",
    });

    const savedPayment = await paymentRepository.save(payment);
    paymentId = savedPayment.id;

    const service = new PaymentInquiryService(
      inquiryRepository,
      paymentRepository,
      dataSource,
    );

    const concurrentRequests = 5;

    const inquiries = await Promise.all(
      Array.from({ length: concurrentRequests }, () =>
        service.createInquiry(paymentId),
      ),
    );

    const attemptNumbers = inquiries
      .map((inquiry) => inquiry.attemptNumber)
      .sort((a, b) => a - b);

    assert.deepEqual(
      attemptNumbers,
      [1, 2, 3, 4, 5],
      "Every concurrent inquiry should receive a unique attempt number",
    );

    const storedInquiries = await inquiryRepository.find({
      where: { paymentId },
      order: { attemptNumber: "ASC" },
    });

    assert.equal(storedInquiries.length, concurrentRequests);
    assert.deepEqual(
      storedInquiries.map((inquiry) => inquiry.attemptNumber),
      [1, 2, 3, 4, 5],
    );

    console.log("Created inquiry attempts:", attemptNumbers);
  } finally {
    if (paymentId) {
      await dataSource.getRepository(PaymentInquiry).delete({ paymentId });
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }

    await dataSource.destroy();
  }
});
