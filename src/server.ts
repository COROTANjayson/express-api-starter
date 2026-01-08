import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { startEmailWorker, closeEmailWorker } from "./workers/email.worker";
import { closeEmailQueue } from "./queues/email.queue";
import { closeRedis } from "./libs/redis.config";

const port = process.env.PORT || 3000;

// Start the email worker
startEmailWorker();

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  server.close(async () => {
    console.log("HTTP server closed");

    try {
      // Close email worker and queue
      await closeEmailWorker();
      await closeEmailQueue();
      await closeRedis();

      console.log("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
