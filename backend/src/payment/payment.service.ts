import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PaymentStatus } from "./payment-status.enum";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash } from "node:crypto";
import { Payment } from "./payment.entity";
import { CreatePaymentDto } from "./create-payment.dto";
import { QueryFailedError } from "typeorm";
import { assertCanTransition } from "./payment-state-machine";
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
  async transitionStatus(
    paymentId: string,
    nextStatus: PaymentStatus,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    try {
      assertCanTransition(payment.status, nextStatus);
    } catch {
      throw new ConflictException(
        `Cannot transition payment from ${payment.status} to ${nextStatus}`,
      );
    }
    const result = await this.paymentRepository
      .createQueryBuilder()
      .update(Payment)
      .set({ status: nextStatus })
      .where("id = :id", { id: paymentId })
      .andWhere("status = :currentStatus", {
        currentStatus: payment.status,
      })
      .execute();

    if (result.affected !== 1) {
      throw new ConflictException(
        "Payment status changed concurrently; retry or reload",
      );
    }

    return {
      ...payment,
      status: nextStatus,
    };
  }
  async create(
    data: CreatePaymentDto,
    idempotencyKey: string,
    merchantId: number,
  ) {
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
      status: PaymentStatus.PENDING,
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
  async getPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }
}
