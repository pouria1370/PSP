import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MerchantService } from "./merchant.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";

@Controller("merchant")
export class MerchantController {
  constructor(private s: MerchantService) {}

  @Post("create")
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() body: CreateMerchantDto) {
    return this.s.create(body);
  }
}
