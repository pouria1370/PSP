import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction, TransactionStatus } from "./transaction.entity";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { Merchant } from "../merchant/merchant.entity";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>
  ) {}

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
    return this.repo.save(tx);
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
