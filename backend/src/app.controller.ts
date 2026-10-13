import { Controller, Get } from "@nestjs/common";
import { DataSource } from "typeorm";

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get("health/db")
  async checkDatabase() {
    const result = await this.dataSource.query(`
      SELECT
        current_database() AS database,
        current_user AS username,
        NOW() AS server_time
    `);

    return {
      status: "ok",
      database: result[0],
    };
  }
}
