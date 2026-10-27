const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  PaymentInquiryWorkflowService,
} = require("../dist/payment/payment-inquiry-workflow.service");

const {
  PaymentInquiryAction,
} = require("../dist/payment/payment-inquiry-decision.service");

const {
  PaymentInquiryResult,
  PaymentInquiryStatus,
} = require("../dist/payment/payment-inquiry.entity");

const { PaymentStatus } = require("../dist/payment/payment-status.enum");

function createWorkflow({ inquiry, paymentStatus }) {
  const inquiryService = {
    getInquiry: async () => inquiry,
  };

  const paymentService = {
    getPayment: async () => ({
      id: inquiry.paymentId,
      status: paymentStatus,
    }),
  };

  const decisionService = {
    decide: (status, result) => {
      assert.equal(status, paymentStatus);
      assert.equal(result, inquiry.result);

      return {
        action: PaymentInquiryAction.REQUIRE_REVIEW,
        reason: "Test decision",
      };
    },
  };

  return new PaymentInquiryWorkflowService(
    inquiryService,
    paymentService,
    decisionService,
  );
}

test("completed inquiry produces a decision", async () => {
  const inquiry = {
    id: "inquiry-1",
    paymentId: "payment-1",
    status: PaymentInquiryStatus.COMPLETED,
    result: PaymentInquiryResult.CONFIRMED,
  };

  const workflow = createWorkflow({
    inquiry,
    paymentStatus: PaymentStatus.UNKNOWN,
  });

  const decision = await workflow.evaluate("inquiry-1");

  assert.equal(decision.action, PaymentInquiryAction.REQUIRE_REVIEW);
});

test("incomplete inquiry cannot produce a decision", async () => {
  const inquiry = {
    id: "inquiry-2",
    paymentId: "payment-1",
    status: PaymentInquiryStatus.PROCESSING,
    result: null,
  };

  const workflow = createWorkflow({
    inquiry,
    paymentStatus: PaymentStatus.UNKNOWN,
  });

  await assert.rejects(workflow.evaluate("inquiry-2"), /completed inquiry/i);
});

test("workflow does not change payment status", async () => {
  const inquiry = {
    id: "inquiry-3",
    paymentId: "payment-1",
    status: PaymentInquiryStatus.COMPLETED,
    result: PaymentInquiryResult.CONFIRMED,
  };

  const workflow = createWorkflow({
    inquiry,
    paymentStatus: PaymentStatus.UNKNOWN,
  });

  await workflow.evaluate("inquiry-3");

  const payment = await workflow.paymentService.getPayment("payment-1");

  assert.equal(payment.status, PaymentStatus.UNKNOWN);
});
