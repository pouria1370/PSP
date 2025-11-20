import { Body, Controller, Get, Post } from "@nestjs/common";
import { MerchantService } from "./merchant.service";

@Controller("merchant")
export class MerchantController {
  constructor(private s: MerchantService) {}

  @Post("create")
  create(@Body() body) {
    return this.s.create(body);
  }
}
