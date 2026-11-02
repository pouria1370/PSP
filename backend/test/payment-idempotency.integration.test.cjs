const test = require("node:test");
const assert = require("node:assert/strict");
const { DataSource } = require("typeorm");
const { config } = require("dotenv");

const { Payment } = require("../dist/payment/payment.entity");
const { Merchant } = require("../dist/merchant/merchant.entity");
const { PaymentService } = require("../dist/payment/payment.service");
const { PaymentStatus } = require("../dist/payment/payment-status.enum");

config();

test("payment idempotency preserves payment and provider request reference", async () => {
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

  const createdPaymentIds = [];

  try {
    const paymentRepository = dataSource.getRepository(Payment);
    const merchantRepository = dataSource.getRepository(Merchant);

    const merchant = await merchantRepository.findOneBy({ id: 4 });

    assert.ok(merchant, "Merchant 4 must exist");

    const service = new PaymentService(paymentRepository);
    const uniqueSuffix = `${Date.now()}-${Math.random()}`;

    // 1. Create a payment, then retry with the same key and payload.
    const idempotencyKey = `idem-retry-${uniqueSuffix}`;

    const payload = {
      orderId: `idem-order-${uniqueSuffix}`,
      amount: 250000,
      currency: "IRR",
    };

    const first = await service.create(payload, idempotencyKey, merchant.id);

    createdPaymentIds.push(first.id);

    const retry = await service.create(payload, idempotencyKey, merchant.id);

    assert.equal(retry.id, first.id);
    assert.equal(
      retry.providerRequestReference,
      first.providerRequestReference,
      "Retry must preserve the provider request reference",
    );

    assert.ok(
      first.providerRequestReference,
      "A provider request reference must be generated",
    );

    assert.equal(first.providerReference, null);

    // 2. Reusing the same key with a different payload must conflict.
    await assert.rejects(
      service.create(
        {
          ...payload,
          amount: 300000,
        },
        idempotencyKey,
        merchant.id,
      ),
      (error) => error.status === 409,
      "Different payload with the same key must return a conflict",
    );

    // 3. Concurrent requests with the same key must resolve to one payment.
    const concurrentKey = `idem-concurrent-${uniqueSuffix}`;

    const concurrentPayload = {
      orderId: `idem-concurrent-order-${uniqueSuffix}`,
      amount: 450000,
      currency: "IRR",
    };

    const results = await Promise.all([
      service.create(concurrentPayload, concurrentKey, merchant.id),
      service.create(concurrentPayload, concurrentKey, merchant.id),
    ]);

    for (const result of results) {
      createdPaymentIds.push(result.id);
    }

    assert.equal(
      results[0].id,
      results[1].id,
      "Concurrent requests must resolve to the same payment",
    );

    assert.equal(
      results[0].providerRequestReference,
      results[1].providerRequestReference,
      "Concurrent requests must resolve to the same provider request reference",
    );

    const persistedPayments = await paymentRepository.find({
      where: {
        merchantId: merchant.id,
        idempotencyKey: concurrentKey,
      },
    });

    assert.equal(
      persistedPayments.length,
      1,
      "Only one payment row must exist for the concurrent idempotency key",
    );

    assert.equal(persistedPayments[0].status, PaymentStatus.PENDING);
  } finally {
    // Delete only records created by this test.
    const uniqueIds = [...new Set(createdPaymentIds)];

    if (uniqueIds.length > 0) {
      await dataSource.getRepository(Payment).delete(uniqueIds);
    }

    await dataSource.destroy();
  }
});
