import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Payment } from "./payment.entity";
import {
  PaymentInquiry,
  PaymentInquiryResult,
  PaymentInquiryStatus,
} from "./payment-inquiry.entity";

@Injectable()
export class PaymentInquiryService {
  constructor(
    @InjectRepository(PaymentInquiry)
    private readonly inquiryRepository: Repository<PaymentInquiry>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async createInquiry(paymentId: string): Promise<PaymentInquiry> {
    return this.dataSource.transaction(async (manager) => {
      const paymentRepository = manager.getRepository(Payment);
      const inquiryRepository = manager.getRepository(PaymentInquiry);

      // Serialize inquiry-number allocation for this payment.
      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        lock: { mode: "pessimistic_write" },
      });

      if (!payment) {
        throw new NotFoundException("Payment not found");
      }

      const latestInquiry = await inquiryRepository.findOne({
        where: { paymentId },
        order: { attemptNumber: "DESC" },
      });

      const attemptNumber = (latestInquiry?.attemptNumber ?? 0) + 1;

      const inquiry = inquiryRepository.create({
        paymentId,
        attemptNumber,
        status: PaymentInquiryStatus.PENDING,
        result: null,
      });

      return inquiryRepository.save(inquiry);
    });
  }
  async completeInquiry(
    inquiryId: string,
    result: PaymentInquiryResult,
  ): Promise<PaymentInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException("Payment inquiry not found");
    }

    if (inquiry.status !== PaymentInquiryStatus.PROCESSING) {
      throw new ConflictException("Only a processing inquiry can be completed");
    }

    const updated = await this.inquiryRepository.update(
      {
        id: inquiryId,
        status: PaymentInquiryStatus.PROCESSING,
      },
      {
        status: PaymentInquiryStatus.COMPLETED,
        result,
        completedAt: new Date(),
      },
    );

    if (updated.affected !== 1) {
      throw new ConflictException("Inquiry state changed concurrently");
    }

    return {
      ...inquiry,
      status: PaymentInquiryStatus.COMPLETED,
      result,
      completedAt: new Date(),
    };
  }
  async markProcessing(inquiryId: string): Promise<PaymentInquiry> {
    const updated = await this.inquiryRepository.update(
      {
        id: inquiryId,
        status: PaymentInquiryStatus.PENDING,
      },
      { status: PaymentInquiryStatus.PROCESSING },
    );

    if (updated.affected !== 1) {
      throw new ConflictException("Inquiry must be pending before processing");
    }

    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException("Payment inquiry not found");
    }

    return inquiry;
  }

  async failInquiry(
    inquiryId: string,
    errorCode: string,
    errorMessage: string,
  ): Promise<PaymentInquiry> {
    const updated = await this.inquiryRepository.update(
      {
        id: inquiryId,
        status: PaymentInquiryStatus.PROCESSING,
      },
      {
        status: PaymentInquiryStatus.FAILED,
        errorCode,
        errorMessage,
        completedAt: new Date(),
      },
    );

    if (updated.affected !== 1) {
      throw new ConflictException(
        "Only a processing inquiry can be marked failed",
      );
    }

    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException("Payment inquiry not found");
    }

    return inquiry;
  }
  async getInquiry(inquiryId: string): Promise<PaymentInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException("Payment inquiry not found");
    }

    return inquiry;
  }
}
