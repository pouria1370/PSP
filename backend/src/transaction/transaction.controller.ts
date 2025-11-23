import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Controller("transactions")
export class TransactionController {
  constructor(private s: TransactionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() body: CreateTransactionDto) {
    return this.s.create(body);
  }

  @Get()
  list(
    @Query("merchantId") merchantId: string,
    @Query("limit") limit = "20",
    @Query("offset") offset = "0"
  ) {
    return this.s.list(merchantId, Number(limit), Number(offset));
  }

  @Get(":id")
  one(@Param("id") id: string) {
    return this.s.get(id);
  }
}
