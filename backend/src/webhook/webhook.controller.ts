import { Controller, Post, Body } from "@nestjs/common";
import { WebhookService } from "./webhook.service";

@Controller("webhook")
export class WebhookController {
  constructor(private s: WebhookService) {}

  @Post("send")
  send(@Body() body: any) {
    return this.s.send(body.payload, body.url);
  }
  @Post("receive")
  receive(@Body() body: any) {
    console.log("received webhook:", body);
    return { ok: true, received: body };
  }
}
