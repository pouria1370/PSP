import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

const worker = new Worker(
  "webhooks",
  async (job: Job) => {
    console.log("worker processing job", job.id, job.name, job.data);
    if (job.name === "transaction.created") {
      const { transactionId, merchantId, url } = job.data as any;
      // In production fetch merchant webhook URL from DB; here job.data may include url override
      const postUrl = url || process.env.APP_BASE_URL + "/webhook/receive";
      try {
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId,
            merchantId,
            ts: new Date().toISOString(),
          }),
        });
        console.log("webhook delivered", res.status);
        return { ok: true, status: res.status };
      } catch (err) {
        console.error("webhook failed", err);
        throw err; // throwing triggers retry/backoff
      }
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log("job completed", job.id);
});
worker.on("failed", (job, err) => {
  console.error("job failed", job?.id, err);
});
console.log("worker started - listening for webhook jobs");
