import { Injectable } from "@nestjs/common";
@Injectable()
export class AuthService {
  login() {
    // replace with real auth later
    return { ok: true, token: "demo-token" };
  }
}
