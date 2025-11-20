import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { TransactionService } from "./transaction.service.js";

@Controller("transaction")
export class TransactionController {
  constructor(private s: TransactionService) {}

  @Get(":id")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.s.get(id);
  }
}
