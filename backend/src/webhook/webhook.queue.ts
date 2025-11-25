import { Queue } from "bullmq";
import IORedis from "ioredis";
import * as process from "process";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export class WebhookQueue {
  queue: Queue;
  constructor() {
    this.queue = new Queue("webhooks", { connection });
  }

  async enqueue(name: string, data: any) {
    await this.queue.add(name, data, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
