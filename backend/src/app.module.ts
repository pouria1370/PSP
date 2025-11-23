import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { MerchantModule } from "./merchant/merchant.module";
import { PaymentModule } from "./payment/payment.module";
import { TransactionModule } from "./transaction/transaction.module";
import { WebhookModule } from "./webhook/webhook.module";
import { DataSourceOptions } from "typeorm";
import * as path from "path";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const type = process.env.DATABASE_TYPE || "sqlite";
        if (type === "postgres") {
          const opts: DataSourceOptions = {
            type: "postgres",
            host: process.env.DATABASE_HOST || "localhost",
            port: Number(process.env.DATABASE_PORT) || 5432,
            username: process.env.DATABASE_USERNAME || "postgres",
            password: process.env.DATABASE_PASSWORD || "password",
            database: process.env.DATABASE_NAME || "psp",
            entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
            synchronize: true,
          };
          return opts;
        } else {
          const opts: DataSourceOptions = {
            type: "sqlite",
            database: process.env.DATABASE_NAME || "data.sqlite",
            entities: [path.join(__dirname, "**", "*.entity.{ts,js}")],
            synchronize: true,
          };
          return opts;
        }
      },
    }),
    AuthModule,
    MerchantModule,
    PaymentModule,
    TransactionModule,
    WebhookModule,
  ],
})
export class AppModule {}
