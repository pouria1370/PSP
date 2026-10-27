import { Injectable } from "@nestjs/common";
import { PaymentStatus } from "./payment-status.enum";
import { PaymentInquiryResult } from "./payment-inquiry.entity";

export enum PaymentInquiryAction {
  REQUIRE_REVIEW = "REQUIRE_REVIEW",
  KEEP_UNKNOWN = "KEEP_UNKNOWN",
  SCHEDULE_RETRY = "SCHEDULE_RETRY",
  NO_ACTION = "NO_ACTION",
}

export interface PaymentInquiryDecision {
  action: PaymentInquiryAction;
  reason: string;
}

@Injectable()
export class PaymentInquiryDecisionService {
  decide(
    paymentStatus: PaymentStatus,
    inquiryResult: PaymentInquiryResult,
  ): PaymentInquiryDecision {
    // Terminal payment states need explicit handling.
    if (
      paymentStatus === PaymentStatus.SETTLED ||
      paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.CANCELLED
    ) {
      if (inquiryResult === PaymentInquiryResult.CONFIRMED) {
        if (paymentStatus === PaymentStatus.SETTLED) {
          return {
            action: PaymentInquiryAction.NO_ACTION,
            reason: "Payment is already settled",
          };
        }

        return {
          action: PaymentInquiryAction.REQUIRE_REVIEW,
          reason:
            "Confirmed inquiry conflicts with the recorded terminal payment status",
        };
      }

      return {
        action: PaymentInquiryAction.NO_ACTION,
        reason: "Inquiry result does not require changing the terminal payment",
      };
    }

    if (paymentStatus !== PaymentStatus.UNKNOWN) {
      throw new Error("Unsupported payment status");
    }

    switch (inquiryResult) {
      case PaymentInquiryResult.CONFIRMED:
        return {
          action: PaymentInquiryAction.REQUIRE_REVIEW,
          reason: "Confirmed inquiry requires financial-state verification",
        };

      case PaymentInquiryResult.NOT_FOUND:
        return {
          action: PaymentInquiryAction.KEEP_UNKNOWN,
          reason: "Missing inquiry record does not prove payment failure",
        };

      case PaymentInquiryResult.PENDING:
        return {
          action: PaymentInquiryAction.SCHEDULE_RETRY,
          reason: "Inquiry result is not final",
        };

      case PaymentInquiryResult.UNKNOWN:
        return {
          action: PaymentInquiryAction.KEEP_UNKNOWN,
          reason: "Insufficient evidence to determine payment outcome",
        };

      default:
        throw new Error("Unsupported inquiry result");
    }
  }
}
