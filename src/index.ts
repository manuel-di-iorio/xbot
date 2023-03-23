import { getStarterFn } from "./lib/index.js";
// import { start as startMongoDB } from "./lib/mongodb/index.js";
// import { start as startChatGpt } from "./lib/chatgpt/index.js";
import { start as startDiscordRegisterCmds } from "./lib/discord/registerCmds.js";
import { start as startDiscord } from "./lib/discord/index.js";
import { logger } from "./logger.js";

try {
  await getStarterFn("App", async () => {
    await Promise.all([
      // startMongoDB(),
      // startChatGpt()
    ]);

    await Promise.all([
      startDiscordRegisterCmds(),
      startDiscord()
    ]);
  })();
} catch (error) {
  logger.error(error);
  process.exit(1);
}
