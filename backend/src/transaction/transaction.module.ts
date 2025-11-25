import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./transaction.entity";
import { Merchant } from "../merchant/merchant.entity";
import { WebhookQueue } from "src/webhook/webhook.queue";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Merchant])],
  controllers: [TransactionController],
  providers: [TransactionService, WebhookQueue],
  exports: [TransactionService],
})
export class TransactionModule {}
