import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TransactionStatus } from "./transaction.entity";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Merchant } from "../merchant/merchant.entity";
import { WebhookQueue } from "src/webhook/webhook.queue";

@Injectable()
export class TransactionService {
  private webhookQueue: WebhookQueue;

  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>
  ) {
    // For MVP simple approach: create queue instance here
    this.webhookQueue = new WebhookQueue();
  }

  async create(dto: CreateTransactionDto) {
    const merchantRepo = this.repo.manager.getRepository(Merchant);
    const merchant = await merchantRepo.findOneBy({ id: dto.merchantId });
    if (!merchant) throw new NotFoundException("merchant not found");

    const tx = this.repo.create({
      merchant,
      amount: dto.amount,
      description: dto.description,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      status: TransactionStatus.PENDING,
    });
    const saved = await this.repo.save(tx);

    // enqueue webhook job for async delivery
    await this.webhookQueue.enqueue("transaction.created", {
      transactionId: saved.id,
      merchantId: merchant.id,
      // optionally include merchant webhook url if known:
      // url: merchant.webhookUrl
    });

    return saved;
  }

  async list(merchantId: string, limit = 20, offset = 0) {
    const [items, total] = await this.repo.findAndCount({
      where: { merchant: { id: merchantId } },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
    });
    return { items, total, limit, offset };
  }

  async get(id: string) {
    return this.repo.findOne({ where: { id }, relations: ["merchant"] });
  }
}
