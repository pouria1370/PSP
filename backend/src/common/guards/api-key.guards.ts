import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const key =
      (req.headers["x-api-key"] as string) || (req.query.apiKey as string);
    if (!key) throw new UnauthorizedException("API key required");
    // In MVP, we don't check DB here. Later: validate against merchant.apiKey
    return true;
  }
}
