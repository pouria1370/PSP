// import { Module } from "@nestjs/common";
// import { AuthModule } from "./auth/auth.module";
// import { MerchantModule } from "./merchant/merchant.module";
// import { PaymentModule } from "./payment/payment.module";
// import { TransactionModule } from "./transaction/transaction.module";
// import { WebhookModule } from "./webhook/webhook.module";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { ConfigModule } from "@nestjs/config";
// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),

//     TypeOrmModule.forRootAsync({
//       useFactory: () => ({
//         type: "postgres",
//         host: process.env.DATABASE_HOST,
//         port: Number(process.env.DATABASE_PORT),
//         username: process.env.DATABASE_USER,
//         password: process.env.DATABASE_PASS,
//         database: process.env.DATABASE_NAME,
//         autoLoadEntities: true,
//         synchronize: true, // بعداً false
//       }),
//     }),
//     AuthModule,
//     MerchantModule,
//     PaymentModule,
//     TransactionModule,
//     WebhookModule,
//   ],
// })
// export class AppModule {}

import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { MerchantModule } from "./merchant/merchant.module";
import { PaymentModule } from "./payment/payment.module";
import { TransactionModule } from "./transaction/transaction.module";
import { WebhookModule } from "./webhook/webhook.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "data.sqlite", // فایل دیتابیس محلی
      autoLoadEntities: true,
      synchronize: true, // فقط برای توسعه
    }),

    AuthModule,
    MerchantModule,
    PaymentModule,
    TransactionModule,
    WebhookModule,
  ],
})
export class AppModule {}
