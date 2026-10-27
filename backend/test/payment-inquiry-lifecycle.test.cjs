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
const { PaymentStatus } = require("../dist/payment/payment-status.enum");

config();

test("inquiry lifecycle preserves payment status and rejects invalid transitions", async () => {
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
        orderId: `inquiry-lifecycle-${suffix}`,
        amount: "1000",
        currency: "IRR",
        status: PaymentStatus.UNKNOWN,
        idempotencyKey: `inquiry-lifecycle-${suffix}`,
        requestHash: "inquiry-lifecycle-test",
      }),
    );

    paymentId = payment.id;

    const service = new PaymentInquiryService(
      inquiryRepository,
      paymentRepository,
      dataSource,
    );

    // A newly created inquiry starts as PENDING.
    const inquiry = await service.createInquiry(paymentId);
    assert.equal(inquiry.status, PaymentInquiryStatus.PENDING);
    assert.equal(inquiry.result, null);

    // An inquiry cannot be completed before processing.
    await assert.rejects(
      service.completeInquiry(inquiry.id, PaymentInquiryResult.UNKNOWN),
      (error) => error.status === 409,
    );

    // Move through the valid lifecycle.
    const processing = await service.markProcessing(inquiry.id);
    assert.equal(processing.status, PaymentInquiryStatus.PROCESSING);

    const completed = await service.completeInquiry(
      inquiry.id,
      PaymentInquiryResult.UNKNOWN,
    );

    assert.equal(completed.status, PaymentInquiryStatus.COMPLETED);
    assert.equal(completed.result, PaymentInquiryResult.UNKNOWN);
    assert.ok(completed.completedAt);

    // The inquiry result must not change the payment status automatically.
    const unchangedPayment = await paymentRepository.findOneBy({
      id: paymentId,
    });
    assert.equal(unchangedPayment.status, PaymentStatus.UNKNOWN);

    // A completed inquiry cannot be completed again.
    await assert.rejects(
      service.completeInquiry(inquiry.id, PaymentInquiryResult.CONFIRMED),
      (error) => error.status === 409,
    );
  } finally {
    if (paymentId) {
      await dataSource.getRepository(PaymentInquiry).delete({ paymentId });
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }

    await dataSource.destroy();
  }
});

test("only one concurrent completion wins", async () => {
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
        orderId: `inquiry-race-${suffix}`,
        amount: "1000",
        currency: "IRR",
        status: PaymentStatus.UNKNOWN,
        idempotencyKey: `inquiry-race-${suffix}`,
        requestHash: "inquiry-race-test",
      }),
    );

    paymentId = payment.id;

    const service = new PaymentInquiryService(
      inquiryRepository,
      paymentRepository,
      dataSource,
    );

    const inquiry = await service.createInquiry(paymentId);
    await service.markProcessing(inquiry.id);

    const results = await Promise.allSettled([
      service.completeInquiry(inquiry.id, PaymentInquiryResult.CONFIRMED),
      service.completeInquiry(inquiry.id, PaymentInquiryResult.UNKNOWN),
    ]);

    const successes = results.filter((result) => result.status === "fulfilled");
    const failures = results.filter((result) => result.status === "rejected");

    assert.equal(successes.length, 1);
    assert.equal(failures.length, 1);

    const storedInquiry = await inquiryRepository.findOneBy({
      id: inquiry.id,
    });

    assert.equal(storedInquiry.status, PaymentInquiryStatus.COMPLETED);
    assert.ok(
      [PaymentInquiryResult.CONFIRMED, PaymentInquiryResult.UNKNOWN].includes(
        storedInquiry.result,
      ),
    );
  } finally {
    if (paymentId) {
      await dataSource.getRepository(PaymentInquiry).delete({ paymentId });
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }

    await dataSource.destroy();
  }
});
test("completing an inquiry does not automatically change payment status", async () => {
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
        orderId: `inquiry-confirmed-${suffix}`,
        amount: "1000",
        currency: "IRR",
        status: PaymentStatus.UNKNOWN,
        idempotencyKey: `inquiry-confirmed-${suffix}`,
        requestHash: "inquiry-confirmed-test",
      }),
    );

    paymentId = payment.id;

    const service = new PaymentInquiryService(
      inquiryRepository,
      paymentRepository,
      dataSource,
    );

    const inquiry = await service.createInquiry(paymentId);

    await service.markProcessing(inquiry.id);

    await service.completeInquiry(inquiry.id, PaymentInquiryResult.CONFIRMED);

    const storedPayment = await paymentRepository.findOneBy({
      id: paymentId,
    });

    assert.equal(storedPayment.status, PaymentStatus.UNKNOWN);
  } finally {
    if (paymentId) {
      await dataSource.getRepository(PaymentInquiry).delete({ paymentId });
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }

    await dataSource.destroy();
  }
});
