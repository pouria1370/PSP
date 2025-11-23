import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Merchant } from "../merchant/merchant.entity";

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Merchant, { nullable: false })
  @JoinColumn()
  merchant!: Merchant;

  @Column("integer")
  amount!: number;

  @Column({ default: "IRR" })
  currency!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "varchar", nullable: true })
  customerEmail?: string;

  @Column({ type: "varchar", nullable: true })
  customerPhone?: string;

  @Column({ type: "varchar", default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
