import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MerchantModule } from "../merchant/merchant.module";
import { ApiKeyGuard } from "./api-key.guard";

@Module({
  imports: [MerchantModule],
  controllers: [AuthController],
  providers: [AuthService, ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class AuthModule {}
