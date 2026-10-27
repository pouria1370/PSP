import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { Payment } from "./payment.entity";

export enum PaymentInquiryStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentInquiryResult {
  CONFIRMED = "CONFIRMED",
  NOT_FOUND = "NOT_FOUND",
  PENDING = "PENDING",
  UNKNOWN = "UNKNOWN",
}

@Entity("payment_inquiries")
@Index("UQ_payment_inquiries_payment_attempt", ["paymentId", "attemptNumber"], {
  unique: true,
})
export class PaymentInquiry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  paymentId!: string;

  @ManyToOne(() => Payment, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "paymentId",
    referencedColumnName: "id",
  })
  payment!: Payment;

  @Column({ type: "integer" })
  attemptNumber!: number;

  @Column({
    type: "varchar",
    length: 20,
    default: PaymentInquiryStatus.PENDING,
  })
  status!: PaymentInquiryStatus;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
  })
  result!: PaymentInquiryResult | null;

  @CreateDateColumn({ type: "timestamptz" })
  requestedAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  errorCode!: string | null;

  @Column({ type: "text", nullable: true })
  errorMessage!: string | null;
}
