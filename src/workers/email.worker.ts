import { Worker, Job } from "bullmq";
import { getRedisClient } from "../libs/redis.config";
import { EmailJobData } from "../queues/email.queue";
import { EmailService } from "../utils/email.service";
import {
  EMAIL_QUEUE_RATE_LIMIT,
  EMAIL_QUEUE_RATE_DURATION,
} from "../utils/config";

let emailWorker: Worker<EmailJobData> | null = null;

export function startEmailWorker(): Worker<EmailJobData> | null {
  if (emailWorker) {
    console.log("Email worker already running");
    return emailWorker;
  }

  const redisClient = getRedisClient();
  if (!redisClient) {
    console.warn("Redis not available. Email worker will not start.");
    return null;
  }

  const emailService = new EmailService();

  emailWorker = new Worker<EmailJobData>(
    "email",
    async (job: Job<EmailJobData>) => {
      console.log(
        `Processing email job ${job.id} (attempt ${job.attemptsMade + 1}/${
          job.opts.attempts
        })`
      );

      try {
        const { type, to, token } = job.data;

        switch (type) {
          case "verification":
            await emailService.sendVerificationEmail(to, token);
            console.log(`✓ Verification email sent to ${to}`);
            break;

          default:
            throw new Error(`Unknown email job type: ${type}`);
        }

        return { success: true };
      } catch (error: any) {
        console.error(`✗ Email job ${job.id} failed:`, error.message || error);
        throw error; // Re-throw to trigger retry mechanism
      }
    },
    {
      connection: redisClient,
      limiter: EMAIL_QUEUE_RATE_LIMIT
        ? {
            max: EMAIL_QUEUE_RATE_LIMIT,
            duration: EMAIL_QUEUE_RATE_DURATION,
          }
        : undefined,
      concurrency: 1, // Process one email at a time to respect rate limits
    }
  );

  // Event listeners for monitoring
  emailWorker.on("completed", (job) => {
    console.log(`✓ Email job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`✗ Email job ${job?.id} failed permanently:`, err.message);
  });

  emailWorker.on("error", (err) => {
    console.error("Email worker error:", err);
  });

  console.log("✓ Email worker started");

  return emailWorker;
}

/**
 * Gracefully close the email worker
 */
export async function closeEmailWorker(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    console.log("Email worker closed");
  }
}

export default emailWorker;
