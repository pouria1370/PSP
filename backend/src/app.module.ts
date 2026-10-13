import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { MerchantModule } from "./merchant/merchant.module";
import { PaymentModule } from "./payment/payment.module";
import { TransactionModule } from "./transaction/transaction.module";
import { WebhookModule } from "./webhook/webhook.module";
import { AppController } from "./app.controller";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("DATABASE_HOST"),
        port: Number(configService.get<string>("DATABASE_PORT", "5433")),
        username: configService.get<string>("DATABASE_USER"),
        password: configService.get<string>("DATABASE_PASS"),
        database: configService.get<string>("DATABASE_NAME"),

        autoLoadEntities: true,

        // فعلاً برای این مرحله غیرفعال می‌ماند.
        synchronize: false,
      }),
    }),

    AuthModule,
    MerchantModule,
    PaymentModule,
    TransactionModule,
    WebhookModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
