import "dotenv/config";
import { createApp } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function main(): Promise<void> {
  await connectDb(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`auth-platform-backend listening on port ${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});
