import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  orderId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsIn(["IRR"])
  currency!: string;
}
