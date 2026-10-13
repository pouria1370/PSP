import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "node:crypto";
import { Merchant } from "./merchant.entity.js";
import { CreateMerchantDto } from "./create-merchant.dto.js";

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly repo: Repository<Merchant>,
  ) {}

  create(data: CreateMerchantDto): Promise<Merchant> {
    const merchant = this.repo.create({
      name: data.name,
      apiKey: randomBytes(32).toString("hex"),
    });

    return this.repo.save(merchant);
  }
}
