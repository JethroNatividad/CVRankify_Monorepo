import { Queue } from "bullmq";
import { env } from "~/env";

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

const queueName = env.REDIS_QUEUE_NAME;

export const resumeQueue = new Queue(queueName, { connection });
