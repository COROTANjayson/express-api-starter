import { Queue } from "bullmq";
import { getRedisClient } from "../libs/redis.config";

/**
 * Email job data types
 */
export interface VerificationEmailJob {
  type: "verification";
  to: string;
  token: string;
}

export type EmailJobData = VerificationEmailJob;

/**
 * Email queue for processing emails asynchronously
 */
let emailQueue: Queue<EmailJobData> | null = null;

export function getEmailQueue(): Queue<EmailJobData> | null {
  if (emailQueue) {
    return emailQueue;
  }

  const redisClient = getRedisClient();
  if (!redisClient) {
    console.warn("Redis not available. Email queue disabled.");
    return null;
  }

  emailQueue = new Queue<EmailJobData>("email", {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3, // Retry failed jobs up to 3 times
      backoff: {
        type: "exponential",
        delay: 5000, // Start with 5 second delay, then exponential backoff
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
    },
  });

  console.log("✓ Email queue initialized");

  return emailQueue;
}

/**
 * Add verification email to queue
 */
export async function queueVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const queue = getEmailQueue();
  if (!queue) {
    throw new Error(
      "Email queue not available. Please configure REDIS_URL in environment."
    );
  }

  await queue.add(
    "verification-email",
    {
      type: "verification",
      to,
      token,
    },
    {
      priority: 1, // Higher priority for verification emails
    }
  );

  console.log(`✓ Verification email queued for ${to}`);
}

/**
 * Gracefully close email queue
 */
export async function closeEmailQueue(): Promise<void> {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
    console.log("Email queue closed");
  }
}

export default getEmailQueue();
