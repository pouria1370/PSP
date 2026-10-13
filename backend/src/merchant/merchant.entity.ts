import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Payment } from "../payment/payment.entity";

@Entity("merchants")
export class Merchant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", unique: true })
  apiKey!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Payment, (payment) => payment.merchant)
  payments!: Payment[];
}
