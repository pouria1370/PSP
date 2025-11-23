import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "../transaction/transaction.entity";
import { Repository } from "typeorm";
import { Merchant } from "../merchant/merchant.entity";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>
  ) {}

  async createForMerchant(merchantId: string, amount = 1000) {
    const m = await this.merchantRepo.findOneBy({ id: merchantId });
    if (!m) throw new NotFoundException("merchant not found");

    const tx = this.txRepo.create({
      merchant: m,
      amount,
      status: "PENDING",
    } as any);
    const saved = await this.txRepo.save(tx);

    return {
      paymentUrl: `${process.env.APP_BASE_URL}/pay/${saved[0].id}`,
      transaction: saved,
    };
  }
}
