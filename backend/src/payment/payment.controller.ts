import { Controller, Post, Param, Body } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("payment")
export class PaymentController {
  constructor(private s: PaymentService) {}

  @Post("create/:merchantId")
  create(
    @Param("merchantId") merchantId: string,
    @Body() body: { amount?: number }
  ) {
    return this.s.createForMerchant(merchantId, body?.amount);
  }
}
