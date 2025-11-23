import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  apiKey!: string;

  @Column({ default: true })
  isActive!: boolean;
}
