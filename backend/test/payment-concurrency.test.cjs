const test = require("node:test");
const assert = require("node:assert/strict");
const { DataSource } = require("typeorm");
const { Payment } = require("../dist/payment/payment.entity");
const { Merchant } = require("../dist/merchant/merchant.entity");
const { PaymentService } = require("../dist/payment/payment.service");
const { PaymentStatus } = require("../dist/payment/payment-status.enum");
const { config } = require("dotenv");

config();

test("concurrent status transitions allow only one winner", async (t) => {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 5433),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: [Payment, Merchant],
    synchronize: false,
  });

  await dataSource.initialize();

  let paymentId;

  try {
    const paymentRepository = dataSource.getRepository(Payment);
    const merchantRepository = dataSource.getRepository(Merchant);

    const merchant = await merchantRepository.findOneBy({ id: 4 });
    assert.ok(merchant, "Merchant 4 must exist");

    const payment = paymentRepository.create({
      merchantId: merchant.id,
      orderId: `concurrency-test-${Date.now()}`,
      amount: "1000",
      currency: "IRR",
      status: PaymentStatus.PENDING,
      idempotencyKey: `concurrency-test-${Date.now()}-${Math.random()}`,
      requestHash: "concurrency-test",
    });

    const savedPayment = await paymentRepository.save(payment);
    paymentId = savedPayment.id;

    const service = new PaymentService(paymentRepository);

    const results = await Promise.allSettled([
      service.transitionStatus(paymentId, PaymentStatus.AUTHORIZING),
      service.transitionStatus(paymentId, PaymentStatus.AUTHORIZING),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    assert.equal(successes.length, 1, "Exactly one transition should succeed");
    assert.equal(failures.length, 1, "Exactly one transition should fail");

    const finalPayment = await paymentRepository.findOneBy({ id: paymentId });
    assert.equal(finalPayment.status, PaymentStatus.AUTHORIZING);
  } finally {
    if (paymentId) {
      await dataSource.getRepository(Payment).delete({ id: paymentId });
    }
    await dataSource.destroy();
  }
});
