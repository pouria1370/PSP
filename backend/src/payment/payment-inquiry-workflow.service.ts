import { ConflictException, Injectable } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentInquiryService } from "./payment-inquiry.service";
import { PaymentInquiryDecisionService } from "./payment-inquiry-decision.service";
import { PaymentInquiryStatus } from "./payment-inquiry.entity";

@Injectable()
export class PaymentInquiryWorkflowService {
  constructor(
    private readonly inquiryService: PaymentInquiryService,
    private readonly paymentService: PaymentService,
    private readonly decisionService: PaymentInquiryDecisionService,
  ) {}

  async evaluate(inquiryId: string) {
    const inquiry = await this.inquiryService.getInquiry(inquiryId);

    if (
      inquiry.status !== PaymentInquiryStatus.COMPLETED ||
      inquiry.result === null
    ) {
      throw new ConflictException("Only a completed inquiry can be evaluated");
    }

    const payment = await this.paymentService.getPayment(inquiry.paymentId);

    return this.decisionService.decide(payment.status, inquiry.result);
  }
}
