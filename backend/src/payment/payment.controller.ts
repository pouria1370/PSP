import { Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
@Controller('payment')
export class PaymentController{
 constructor(private s:PaymentService){}
 @Post('create') create(){ return this.s.create(); }
}