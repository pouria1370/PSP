import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class WebhookService {
  async send(payload: any, url: string) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      console.error("webhook error", err);
      return { ok: false, error: String(err) };
    }
  }
}
