import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "../transaction/transaction.entity";
import { Merchant } from "../merchant/merchant.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Merchant])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
