import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

async function main() {
  await connectDB();
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] received ${signal}, shutting down gracefully`);
    server.close(async () => {
      const { disconnectDB } = await import("./config/db.js");
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
