import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash } from "node:crypto";
import { Payment } from "./payment.entity";
import { CreatePaymentDto } from "./create-payment.dto";
import { QueryFailedError } from "typeorm";
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
    const merchantId = 1; // موقت؛ بعداً از احراز هویت استخراج می‌شود
    const requestHash = this.generateRequestHash(data);

    const existingPayment = await this.paymentRepository.findOne({
      where: { merchantId, idempotencyKey },
    });

    if (existingPayment) {
      if (existingPayment.requestHash !== requestHash) {
        throw new ConflictException(
          "Idempotency-Key was already used with a different request",
        );
      }

      return existingPayment;
    }

    const payment = this.paymentRepository.create({
      orderId: data.orderId,
      amount: String(data.amount),
      currency: data.currency,
      status: "PENDING",
      merchantId,
      idempotencyKey,
      requestHash,
    });

    try {
      return await this.paymentRepository.save(payment);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (
          error as QueryFailedError & {
            driverError: { code?: string; constraint?: string };
          }
        ).driverError.code === "23505" &&
        (
          error as QueryFailedError & {
            driverError: { code?: string; constraint?: string };
          }
        ).driverError.constraint === "UQ_payments_merchant_idempotency_key"
      ) {
        const concurrentPayment = await this.paymentRepository.findOne({
          where: { merchantId, idempotencyKey },
        });

        if (concurrentPayment) {
          if (concurrentPayment.requestHash !== requestHash) {
            throw new ConflictException(
              "Idempotency-Key was already used with a different request",
            );
          }

          return concurrentPayment;
        }
      }

      throw error;
    }
  }
}
