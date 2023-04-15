import { getStarterFn } from "./lib/index.js";
import { start as startRedis } from "./lib/redis/index.js";
// import { start as startChatGpt } from "./lib/chatgpt/index.js";
import { start as startDiscord } from "./lib/discord/index.js";
import { logger } from "./logger.js";

try {
  await getStarterFn("App", async () => {
    await Promise.all([
      startRedis(),
      // startChatGpt()
    ]);

    await Promise.all([
      startDiscord()
    ]);
  })();
} catch (error) {
  logger.error(error);
  process.exit(1);
}
