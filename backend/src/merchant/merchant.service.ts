import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Merchant } from "./merchant.entity.js";
import { Repository } from "typeorm/repository/Repository.js";

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private repo: Repository<Merchant>
  ) {}

  create(data) {
    return this.repo.save(this.repo.create(data));
  }
}
