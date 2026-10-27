const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  PaymentInquiryDecisionService,
  PaymentInquiryAction,
} = require("../dist/payment/payment-inquiry-decision.service");

const {
  PaymentInquiryResult,
} = require("../dist/payment/payment-inquiry.entity");

const { PaymentStatus } = require("../dist/payment/payment-status.enum");

test("CONFIRMED requires review before changing payment status", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.UNKNOWN,
    PaymentInquiryResult.CONFIRMED,
  );

  assert.equal(decision.action, PaymentInquiryAction.REQUIRE_REVIEW);
});

test("NOT_FOUND must not automatically mark payment as failed", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.UNKNOWN,
    PaymentInquiryResult.NOT_FOUND,
  );

  assert.equal(decision.action, PaymentInquiryAction.KEEP_UNKNOWN);
});

test("PENDING recommends a future inquiry", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.UNKNOWN,
    PaymentInquiryResult.PENDING,
  );

  assert.equal(decision.action, PaymentInquiryAction.SCHEDULE_RETRY);
});

test("UNKNOWN preserves the unresolved state", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.UNKNOWN,
    PaymentInquiryResult.UNKNOWN,
  );

  assert.equal(decision.action, PaymentInquiryAction.KEEP_UNKNOWN);
});

test("unsupported payment status is rejected", () => {
  const service = new PaymentInquiryDecisionService();

  assert.throws(
    () => service.decide("INVALID_STATUS", PaymentInquiryResult.NOT_FOUND),
    /Unsupported payment status/,
  );
});
test("SETTLED payment is not changed by a new inquiry result", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.SETTLED,
    PaymentInquiryResult.CONFIRMED,
  );

  assert.equal(decision.action, PaymentInquiryAction.NO_ACTION);
});

test("FAILED payment with a confirmed inquiry requires review", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.FAILED,
    PaymentInquiryResult.CONFIRMED,
  );

  assert.equal(decision.action, PaymentInquiryAction.REQUIRE_REVIEW);
});

test("CANCELLED payment with a confirmed inquiry requires review", () => {
  const service = new PaymentInquiryDecisionService();

  const decision = service.decide(
    PaymentStatus.CANCELLED,
    PaymentInquiryResult.CONFIRMED,
  );

  assert.equal(decision.action, PaymentInquiryAction.REQUIRE_REVIEW);
});
