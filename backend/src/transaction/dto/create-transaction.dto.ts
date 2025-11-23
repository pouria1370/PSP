import { IsUUID, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {
  @IsUUID()
  merchantId!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;
}
