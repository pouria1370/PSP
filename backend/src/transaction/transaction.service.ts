import { Injectable } from "@nestjs/common";
@Injectable()
export class TransactionService {
  get(id: number) {
    return { id, status: "success" };
  }
}
