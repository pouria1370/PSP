import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash } from "node:crypto";
import { Payment } from "./payment.entity";
import { CreatePaymentDto } from "./create-payment.dto";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}
  private generateRequestHash(data: CreatePaymentDto): string {
    const payload = JSON.stringify({
      orderId: data.orderId,
      amount: String(data.amount),
      currency: data.currency,
    });

    return createHash("sha256").update(payload).digest("hex");
  }
  async create(data: CreatePaymentDto, idempotencyKey: string) {
    const payment = this.paymentRepository.create({
      orderId: data.orderId,
      amount: String(data.amount),
      currency: data.currency,
      status: "PENDING",
      merchantId: 1,
      idempotencyKey,
      requestHash: this.generateRequestHash(data),
    });

    return this.paymentRepository.save(payment);
  }
}
