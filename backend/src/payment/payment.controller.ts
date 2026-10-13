import {
  Body,
  Controller,
  Headers,
  Post,
  BadRequestException,
} from "@nestjs/common";

import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./create-payment.dto";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create")
  create(
    @Body() body: CreatePaymentDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException("Idempotency-Key header is required");
    }

    return this.paymentService.create(body, idempotencyKey);
  }
}
