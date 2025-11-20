import { Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
@Controller('webhook')
export class WebhookController{
 constructor(private s:WebhookService){}
 @Post('send') send(){ return this.s.send(); }
}