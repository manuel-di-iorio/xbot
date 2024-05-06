import { getStarterFn } from "./lib/index.js";
import { start as startRedis } from "./lib/redis/index.js";
import { start as startDiscord } from "./lib/discord/index.js";
import { start as startScheduler } from "./lib/scheduler/index.js";
import { start as startTwitch } from "./lib/twitch/index.js";
import { logger } from "./logger.js";

try {
  await getStarterFn("App", async () => {
    await Promise.all([
      startRedis(),
    ]);

    await Promise.all([
      startDiscord()
    ]);

    await Promise.all([
      startScheduler(),
      startTwitch()
    ]);
  })();
} catch (error) {
  logger.error(error);
  process.exit(1);
}
