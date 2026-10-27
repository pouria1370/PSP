import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Payment } from "./payment.entity";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { AuthModule } from "../auth/auth.module";
import { MerchantModule } from "../merchant/merchant.module";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { PaymentInquiry } from "./payment-inquiry.entity";
import { PaymentInquiryService } from "./payment-inquiry.service";
import { PaymentInquiryDecisionService } from "./payment-inquiry-decision.service";
import { PaymentInquiryWorkflowService } from "./payment-inquiry-workflow.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentInquiry]),
    AuthModule,
    MerchantModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ApiKeyGuard,
    PaymentInquiryService,
    PaymentInquiryDecisionService,
    PaymentInquiryWorkflowService,
  ],
})
export class PaymentModule {}
