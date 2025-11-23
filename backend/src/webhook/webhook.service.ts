import { Injectable } from "@nestjs/common";
@Injectable()
export class WebhookService {
  async send(payload: any, url: string) {
    // simplified: in production queue+retry+HMAC
    console.log("Webhook send to", url, "payload:", payload);
    return { ok: true };
  }
}
