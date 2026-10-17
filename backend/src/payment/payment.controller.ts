import {
  Body,
  Controller,
  Headers,
  Post,
  BadRequestException,
} from "@nestjs/common";

import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./create-payment.dto";
import { UseGuards, Req } from "@nestjs/common";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { Request } from "express";

type AuthenticatedRequest = Request & {
  merchant: {
    id: number;
    name: string;
  };
};
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @UseGuards(ApiKeyGuard)
  @Post("create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreatePaymentDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException("Idempotency-Key header is required");
    }

    return this.paymentService.create(
      body,
      idempotencyKey,
      request.merchant.id,
    );
  }
}
