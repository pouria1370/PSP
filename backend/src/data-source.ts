import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Payment } from "./payment/payment.entity";
import { Merchant } from "./merchant/merchant.entity";
import { PaymentInquiry } from "./payment/payment-inquiry.entity";
config();

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,

  entities: [Payment, Merchant, PaymentInquiry],
  migrations: ["src/migrations/*.ts"],
  migrationsTransactionMode: "all",
  synchronize: false,
});
