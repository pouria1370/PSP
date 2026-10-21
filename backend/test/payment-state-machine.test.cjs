const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canTransition,
  assertCanTransition,
} = require("../dist/payment/payment-state-machine.js");

const { PaymentStatus } = require("../dist/payment/payment-status.enum.js");

test("allows PENDING -> AUTHORIZING", () => {
  assert.equal(
    canTransition(PaymentStatus.PENDING, PaymentStatus.AUTHORIZING),
    true,
  );
});

test("allows AUTHORIZING -> UNKNOWN", () => {
  assert.equal(
    canTransition(PaymentStatus.AUTHORIZING, PaymentStatus.UNKNOWN),
    true,
  );
});

test("rejects SETTLED -> PENDING", () => {
  assert.equal(
    canTransition(PaymentStatus.SETTLED, PaymentStatus.PENDING),
    false,
  );
});

test("rejects FAILED -> SETTLED", () => {
  assert.equal(
    canTransition(PaymentStatus.FAILED, PaymentStatus.SETTLED),
    false,
  );
});

test("throws when an invalid transition is asserted", () => {
  assert.throws(
    () => assertCanTransition(PaymentStatus.SETTLED, PaymentStatus.PENDING),
    /Invalid payment transition/,
  );
});
