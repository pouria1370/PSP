import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Merchant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  apiKey!: string;

  @Column()
  isActive!: boolean;
}
