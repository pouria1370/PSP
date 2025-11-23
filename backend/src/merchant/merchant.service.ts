import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Merchant } from "./merchant.entity";
import { Repository } from "typeorm";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { randomBytes } from "crypto";

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private repo: Repository<Merchant>
  ) {}

  async create(dto: CreateMerchantDto) {
    const apiKey = randomBytes(16).toString("hex");
    const merchant = this.repo.create({ name: dto.name, apiKey });
    return this.repo.save(merchant);
  }

  async findByApiKey(apiKey: string) {
    return this.repo.findOneBy({ apiKey });
  }
}
