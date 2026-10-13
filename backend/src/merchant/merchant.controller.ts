import { Body, Controller, Post } from "@nestjs/common";

import { MerchantService } from "./merchant.service.js";
import { CreateMerchantDto } from "./create-merchant.dto.js";

@Controller("merchant")
export class MerchantController {
  constructor(private readonly service: MerchantService) {}

  @Post("create")
  create(@Body() body: CreateMerchantDto) {
    return this.service.create(body);
  }
}
