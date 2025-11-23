import { Injectable } from "@nestjs/common";
@Injectable()
export class AuthService {
  login() {
    return { ok: true, token: "demo" };
  }
}
