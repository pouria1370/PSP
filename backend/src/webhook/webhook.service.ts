import { Injectable } from '@nestjs/common';
@Injectable()
export class WebhookService { send(){ return {sent:true}; } }