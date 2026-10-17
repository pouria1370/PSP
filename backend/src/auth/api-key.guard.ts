import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { MerchantService } from "../merchant/merchant.service";

type AuthenticatedRequest = Request & {
  merchant: {
    id: number;
    name: string;
  };
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly merchantService: MerchantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const apiKey = request.headers["x-api-key"];

    if (typeof apiKey !== "string" || !apiKey.trim()) {
      throw new UnauthorizedException("API key is required");
    }

    const merchant = await this.merchantService.findActiveByApiKey(apiKey);

    if (!merchant) {
      throw new UnauthorizedException("Invalid API key");
    }

    request.merchant = {
      id: merchant.id,
      name: merchant.name,
    };

    return true;
  }
}
