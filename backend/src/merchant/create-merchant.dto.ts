import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
