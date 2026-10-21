import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PaymentStatus } from "./payment-status.enum";
import { Merchant } from "../merchant/merchant.entity";
@Entity("payments")
@Index(
  "UQ_payments_merchant_idempotency_key",
  ["merchantId", "idempotencyKey"],
  { unique: true },
)
@Check("CHK_payments_amount_positive", '"amount" > 0')
@Check(
  "CHK_payments_status_valid",
  `"status" IN (
    'PENDING',
    'AUTHORIZING',
    'AUTHORIZED',
    'SETTLED',
    'FAILED',
    'UNKNOWN',
    'CANCELLED'
  )`,
)
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "integer" })
  merchantId!: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.payments, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "merchantId",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_payments_merchant",
  })
  merchant!: Merchant;
  @Column({ type: "varchar", length: 100 })
  orderId!: string;

  @Column({ type: "bigint" })
  amount!: string;

  @Column({ type: "varchar", length: 3 })
  currency!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ type: "varchar", length: 128 })
  idempotencyKey!: string;

  @Column({ type: "varchar", length: 64 })
  requestHash!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
