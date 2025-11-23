import { Module } from "@nestjs/common";
import { MerchantController } from "./merchant.controller";
import { MerchantService } from "./merchant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Merchant } from "./merchant.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Merchant])],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
