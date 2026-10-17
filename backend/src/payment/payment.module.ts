import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Payment } from "./payment.entity";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { AuthModule } from "../auth/auth.module";
import { MerchantModule } from "../merchant/merchant.module";
import { ApiKeyGuard } from "../auth/api-key.guard";
@Module({
  imports: [TypeOrmModule.forFeature([Payment]), AuthModule, MerchantModule],
  controllers: [PaymentController],
  providers: [PaymentService, ApiKeyGuard],
})
export class PaymentModule {}
